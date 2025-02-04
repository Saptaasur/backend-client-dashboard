const mongoose = require('mongoose'); 
const express = require('express');
const router = express.Router();
const ClientDetails = require('../models/ClientDetails');
const authenticate = require('../middleware/authenticate');
const ClientAuth = require('../models/ClientAuth');

router.get('/client-info', authenticate, async (req, res) => {
  try {
    console.log("Authenticated user ID:", req.user.id); // Debugging user ID

    // ✅ Convert userId to ObjectId to ensure a match
    const clientDetails = await ClientDetails.findOne({
      userId: new mongoose.Types.ObjectId(req.user.id)
    }).select('-password');  // Exclude the password field

    if (!clientDetails) {
      return res.status(404).json({ message: 'Client details not found' });
    }

    res.json(clientDetails);
  } catch (error) {
    console.error("Error fetching client data:", error.stack); // Log the error stack for more detail
    res.status(500).json({ message: 'Error fetching client data' });
  }
});

// ✅ Update client details
router.post('/update-client', authenticate, async (req, res) => {
  const { name, companySize, preferredLanguage } = req.body;

  try {
    console.log("Authenticated user ID (Update):", req.user.id);

    const clientDetails = await ClientDetails.findOneAndUpdate(
      { userId: req.user.id },
      { name, companySize, preferredLanguage },
      { new: true }
    );

    if (!clientDetails) return res.status(404).json({ message: 'Client details not found' });

    res.json(clientDetails);
  } catch (error) {
    console.error("Error updating client data:", error);
    res.status(500).json({ message: 'Error updating client data' });
  }
});
router.post('/change-password', authenticate, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  
  try {
    const clientAuth = await ClientAuth.findOne({ userId: req.user.id }); // Find the user by userId
    if (!clientAuth) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the old password
    const isMatch = await clientAuth.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    // Validate the new password (e.g., length, complexity)
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password is too short' });
    }

    // Update the password with the new hashed password
    clientAuth.password = newPassword; // The password will be hashed in the pre-save hook
    await clientAuth.save(); // Save the updated password

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// ✅ Add a project
router.post('/add-project', authenticate, async (req, res) => {
  const { name, status, developer } = req.body;

  try {
    console.log("Authenticated user ID (Add Project):", req.user.id);

    const clientDetails = await ClientDetails.findOne({ userId: req.user.id });
    if (!clientDetails) return res.status(404).json({ message: 'Client details not found' });

    clientDetails.projects.push({ name, status, developer });
    await clientDetails.save();

    res.json({ message: 'Project added successfully', clientDetails });
  } catch (error) {
    console.error("Error adding project:", error);
    res.status(500).json({ message: 'Error adding project' });
  }
});
// Fetch client info including projects for the authenticated user
router.get('/project-info', authenticate, async (req, res) => {
  try {
    const clientDetails = await ClientDetails.findOne({
      userId: req.user.id, // Use the userId to fetch the correct client
    }).select('projects'); // Select only the projects field

    if (!clientDetails || !clientDetails.projects) {
      return res.status(404).json({ message: 'No projects found for this client' });
    }

    res.json(clientDetails.projects); // Return the projects array
  } catch (error) {
    console.error("Error fetching project data:", error);
    res.status(500).json({ message: 'Error fetching project data' });
  }
});
router.post('/update-project', authenticate, async (req, res) => {
  const { projectId, name, status, developer, dueDate } = req.body;

  try {
    // Find the ClientDetails document that contains the projects array
    const clientDetails = await ClientDetails.findOne({ userId: req.user.id });
    
    if (!clientDetails) return res.status(404).json({ message: "Client details not found" });

    // Find the project by its ID inside the projects array and update it
    const project = clientDetails.projects.id(projectId);

    if (!project) return res.status(404).json({ message: "Project not found" });

    project.name = name;
    project.status = status;
    project.developer = developer;
    project.dueDate = dueDate;

    // Save the updated client details
    await clientDetails.save();

    res.json(project); // Return the updated project
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: 'Error updating project' });
  }
});

router.delete('/delete-project/:projectId', authenticate, async (req, res) => {
  const { projectId } = req.params;

  try {
    // Find the ClientDetails document containing the projects array
    const clientDetails = await ClientDetails.findOne({ userId: req.user.id });

    if (!clientDetails) return res.status(404).json({ message: "Client details not found" });

    // Use pull() to remove the project from the array by its projectId
    const projectIndex = clientDetails.projects.findIndex(project => project._id.toString() === projectId);

    if (projectIndex === -1) return res.status(404).json({ message: "Project not found" });

    // Remove the project from the array
    clientDetails.projects.splice(projectIndex, 1);

    // Save the updated clientDetails document
    await clientDetails.save();

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: 'Error deleting project' });
  }
});




module.exports = router;
