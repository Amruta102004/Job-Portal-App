import Application from "../models/application.model.js";
import Job from "../models/job.model.js";

// Apply for a job
export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;

        if (!jobId) {
            return res.status(400).json({
                message: "Job ID is required",
                success: false
            });
        }

        // Check if the user has already applied for the job
        const existingApplication = await Application.findOne({
            applicant: userId,
            job: jobId
        });

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this job",
                success: false
            });
        }

        // Check if the job exists
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        // Create a new application
        const newApplication = await Application.create({
            applicant: userId,
            job: jobId
        });

        // Initialize applications array for old jobs
        if (!job.applications) {
            job.applications = [];
        }

        // Add application to the job
        job.applications.push(newApplication._id);

        await job.save();

        return res.status(201).json({
            message: "Application submitted successfully",
            success: true
        });

    } catch (error) {
        console.error("Error applying for job:", error);

        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};


// Get jobs applied by the logged-in user
export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.id;

        const applications = await Application.find({
            applicant: userId
        })
            .sort({ createdAt: -1 })
            .populate({
                path: "job",
                populate: {
                    path: "company"
                }
            });

        if (applications.length === 0) {
            return res.status(404).json({
                message: "No applications found",
                success: false
            });
        }

        return res.status(200).json({
            applications,
            success: true
        });

    } catch (error) {
        console.error("Error getting applied jobs:", error);

        return res.status(500).json({
            message: "Server Error",
            success: false
        });
    }
};


// Get applicants for a particular job
export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;

        const job = await Job.findById(jobId).populate({
            path: "applications",
            options: {
                sort: { createdAt: -1 }
            },
            populate: {
                path: "applicant",
                options: {
                    sort: { createdAt: -1 }
                }
            }
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            });
        }

        return res.status(200).json({
            job,
            success: true
        });

    } catch (error) {
        console.error("Error getting applicants:", error);

        return res.status(500).json({
            message: "Server Error",
            success: false
        });
    }
};


// Update application status
export const updateStatus = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const {status} = req.body;

        if (!status) {
            return res.status(400).json({
                message: "Invalid status",
                success: false
            });
        }

        // Find application
        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                message: "Application not found",
                success: false
            });
        }

        // Update status
        application.status = status.toLowerCase();

        await application.save();

        return res.status(200).json({
            message: "Application status updated",
            success: true
        });

    } catch (error) {
        console.error("Error updating application status:", error);

        return res.status(500).json({
            message: "Server Error",
            success: false
        });
    }
};