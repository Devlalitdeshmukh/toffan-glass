const Service = require("../models/Service");
const fs = require("fs");
const path = require("path");

const getAllServices = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortField = 'created_at', sortDirection = 'DESC', search = '' } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Convert field names to match DB columns
    let orderByField = sortField;
    if (sortField === 'title') orderByField = 's.title';
    else if (sortField === 'status') orderByField = 's.status';
    else if (sortField === 'createdAt') orderByField = 's.created_at';
    else if (sortField === 'updatedAt') orderByField = 's.updated_at';
    
    const sortDir = sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    const services = await Service.getAllPaginated(
      parseInt(offset), 
      parseInt(limit), 
      orderByField, 
      sortDir, 
      search
    );
    
    const totalCount = await Service.getCount(search);
    
    res.json({
      message: "Services retrieved successfully",
      services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit)),
      }
    });
  } catch (error) {
    console.error("Get all services error:", error);
    res.status(500).json({
      error: "Failed to retrieve services",
      message: error.message,
    });
  }
};

const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.getById(id);

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.json({
      message: "Service retrieved successfully",
      service,
    });
  } catch (error) {
    console.error("Get service by ID error:", error);
    res.status(500).json({
      error: "Failed to retrieve service",
      message: error.message,
    });
  }
};

const createService = async (req, res) => {
  try {
    const { title, shortDescription, description, status, icon } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        error: "Service title is required",
      });
    }

    const validStatuses = ["ACTIVE", "INACTIVE"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Must be ACTIVE or INACTIVE",
      });
    }

    const serviceId = await Service.create({
      title,
      shortDescription,
      description,
      status: status || "ACTIVE",
      icon,
    });

    // Handle image uploads if any
    if (req.files && req.files.length > 0) {
      // Sort by filename or index if possible, otherwise default order
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        // First image is primary by default if not specified
        const isPrimary = i === 0;
        await Service.addImage(
          serviceId,
          `/uploads/service-images/${file.filename}`,
          "",
          isPrimary,
          i,
        );
      }
    }

    const newService = await Service.getById(serviceId);

    res.status(201).json({
      message: "Service created successfully",
      service: newService,
    });
  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({
      error: "Failed to create service",
      message: error.message,
    });
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, shortDescription, description, status, icon } = req.body;

    // Check if service exists
    const existingService = await Service.getById(id);
    if (!existingService) {
      return res.status(404).json({ error: "Service not found" });
    }

    const validStatuses = ["ACTIVE", "INACTIVE"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Must be ACTIVE or INACTIVE",
      });
    }

    const updated = await Service.update(id, {
      title,
      shortDescription,
      description,
      status,
      icon,
    });

    if (!updated && !req.files) {
      // If no text fields updated and no files, it might just be the same data, but usually update returns success if matched.
      // However, Service.update returns affectedRows > 0. If no changes, affectedRows is 0.
      // We'll proceed to check files.
    }

    // Handle new image uploads if any
    if (req.files && req.files.length > 0) {
      // Get current max sort order
      let currentMaxOrder = 0;
      if (existingService.images && existingService.images.length > 0) {
        currentMaxOrder = Math.max(
          ...existingService.images.map((img) => img.sortOrder || 0),
        );
      }

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        await Service.addImage(
          id,
          `/uploads/service-images/${file.filename}`,
          "",
          false,
          currentMaxOrder + i + 1,
        );
      }
    }

    const updatedService = await Service.getById(id);

    res.json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({
      error: "Failed to update service",
      message: error.message,
    });
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    // Get service to delete images from file system
    const service = await Service.getById(id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Delete images from filesystem
    if (service.images && service.images.length > 0) {
      service.images.forEach((img) => {
        const imagePath = path.join(__dirname, "../../", img.imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    const deleted = await Service.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.json({
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({
      error: "Failed to delete service",
      message: error.message,
    });
  }
};

const deleteServiceImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    // Verify image belongs to service or just delete by ID if simple
    // For simplicity, we just delete the image record.
    // Ideally fetch image path first to delete from FS.

    // TODO: Get image path and delete from FS if needed.
    // For now, we assume database deletion cascades or similar cleanup handles it,
    // For robustness, let's implement file deletion if we can fetch it.

    // Since we don't have a direct "getImageById" in service model yet (it's embedded),
    // we can fetch the service and find the image.
    const service = await Service.getById(id);
    if (!service) return res.status(404).json({ error: "Service not found" });

    const image = service.images.find((img) => img.id == imageId);

    if (image) {
      const imagePath = path.join(__dirname, "../../", image.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error("Failed to delete local image file:", err);
        });
      }
      await Service.deleteImage(imageId);
    } else {
      return res.status(404).json({ error: "Image not found in this service" });
    }

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete service image error:", error);
    res.status(500).json({
      error: "Failed to delete image",
      message: error.message,
    });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  deleteServiceImage,
};
