const Site = require("../models/Site");
const City = require("../models/City");
const User = require("../models/User");

const safeParseJson = (value, fallback = null) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const parseLineItemsFromPayload = (payload = {}) => {
  const parsedDescription = safeParseJson(payload.description, {});
  const explicitLineItems = safeParseJson(payload.lineItems, null);
  const lineItems = Array.isArray(explicitLineItems)
    ? explicitLineItems
    : Array.isArray(parsedDescription?.lineItems)
      ? parsedDescription.lineItems
      : [];
  return lineItems;
};

const validateLineItems = (lineItems = []) => {
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    return "At least one product/service item is required";
  }

  for (const item of lineItems) {
    const quantity = Number(item?.quantity ?? 0);
    const discountValue = Number(item?.discountValue ?? 0);
    const vatPercent = Number(item?.vatPercent ?? 0);
    const price = Number(item?.price ?? 0);

    if (!item?.itemName || String(item.itemName).trim() === "") {
      return "Product / Service Name is required for each item";
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return "Quantity must be greater than zero";
    }
    if (!Number.isFinite(discountValue) || discountValue < 0) {
      return "Discount cannot be negative";
    }
    if (!Number.isFinite(vatPercent) || vatPercent < 0 || vatPercent > 100) {
      return "VAT must be between 0 and 100";
    }
    if (!Number.isFinite(price) || price < 0) {
      return "Price cannot be negative";
    }
  }

  return null;
};

const getAllSites = async (req, res) => {
  try {
    const sites = await Site.getAll();
    res.json({
      message: "Sites retrieved successfully",
      sites,
    });
  } catch (error) {
    console.error("Get all sites error:", error);
    res.status(500).json({
      error: "Failed to retrieve sites",
      message: error.message,
    });
  }
};

const getSiteById = async (req, res) => {
  try {
    const { id } = req.params;
    const site = await Site.getById(id);

    if (!site) {
      return res.status(404).json({ error: "Site not found" });
    }

    res.json({
      message: "Site retrieved successfully",
      site,
    });
  } catch (error) {
    console.error("Get site by ID error:", error);
    res.status(500).json({
      error: "Failed to retrieve site",
      message: error.message,
    });
  }
};

const createSite = async (req, res) => {
  try {
    const payload = req.body || {};
    const {
      name,
      address,
      cityId,
      userId: requestUserId,
      customerId,
      status,
      startDate,
      completionDate,
      description,
    } = payload;
    const userId = requestUserId || customerId;
    const lineItems = parseLineItemsFromPayload(payload);

    // Validation
    if (!name) {
      return res.status(400).json({
        error: "Site name is required",
      });
    }

    if (!userId) {
      return res.status(400).json({
        error: "Customer is required",
      });
    }

    const customer = await User.findById(userId);
    if (!customer || customer.role !== "CUSTOMER") {
      return res.status(400).json({
        error: "Invalid customer ID",
      });
    }

    // Check if city exists
    if (cityId) {
      const city = await City.getById(cityId);
      if (!city) {
        return res.status(400).json({
          error: "Invalid city ID",
        });
      }
    }

    // Validate status
    const validStatuses = ["COMING_SOON", "WORKING", "COMPLETED"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error:
          "Invalid status. Must be one of: COMING_SOON, WORKING, COMPLETED",
      });
    }

    // Validate dates
    if (startDate && completionDate) {
      const start = new Date(startDate);
      const completion = new Date(completionDate);
      if (start > completion) {
        return res.status(400).json({
          error: "Start date cannot be after completion date",
        });
      }
    }

    const lineItemsValidationError = validateLineItems(lineItems);
    if (lineItemsValidationError) {
      return res.status(400).json({ error: lineItemsValidationError });
    }

    const siteId = await Site.create({
      name,
      address,
      cityId,
      userId,
      status: status || "COMING_SOON",
      startDate,
      completionDate,
      description,
    });

    await Site.replaceSiteProducts(siteId, lineItems, req?.user?.id || null);

    // Handle image uploads if any
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Add image to site_images table
        await Site.addImage(siteId, `/uploads/site-images/${file.filename}`);
      }
    }

    const newSite = await Site.getById(siteId);

    res.status(201).json({
      message: "Site created successfully",
      site: newSite,
    });
  } catch (error) {
    console.error("Create site error:", error);
    res.status(500).json({
      error: "Failed to create site",
      message: error.message,
    });
  }
};

const updateSite = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if site exists before deriving fallback values
    const existingSite = await Site.getById(id);
    if (!existingSite) {
      return res.status(404).json({ error: "Site not found" });
    }

    const payload = req.body || {};
    const {
      name,
      address,
      cityId,
      userId: requestUserId,
      customerId,
      status,
      startDate,
      completionDate,
      description,
    } = payload;
    const lineItems = parseLineItemsFromPayload(payload);

    const resolvedSite = {
      name: name ?? existingSite.name,
      address: address ?? existingSite.address,
      cityId: cityId ?? existingSite.cityId,
      userId: requestUserId || customerId || existingSite.userId || existingSite.customerId,
      status: status || existingSite.status,
      startDate: startDate ?? existingSite.startDate,
      completionDate: completionDate ?? existingSite.completionDate,
      description: description ?? existingSite.description,
    };

    // Check if city exists if provided
    if (resolvedSite.cityId) {
      const city = await City.getById(resolvedSite.cityId);
      if (!city) {
        return res.status(400).json({
          error: "Invalid city ID",
        });
      }
    }

    if (resolvedSite.userId) {
      const customer = await User.findById(resolvedSite.userId);
      if (!customer || customer.role !== "CUSTOMER") {
        return res.status(400).json({
          error: "Invalid customer ID",
        });
      }
    }

    // Validate status if provided
    const validStatuses = ["COMING_SOON", "WORKING", "COMPLETED"];
    if (resolvedSite.status && !validStatuses.includes(resolvedSite.status)) {
      return res.status(400).json({
        error:
          "Invalid status. Must be one of: COMING_SOON, WORKING, COMPLETED",
      });
    }

    // Validate dates if provided
    if (resolvedSite.startDate && resolvedSite.completionDate) {
      const start = new Date(resolvedSite.startDate);
      const completion = new Date(resolvedSite.completionDate);
      if (start > completion) {
        return res.status(400).json({
          error: "Start date cannot be after completion date",
        });
      }
    }

    const lineItemsValidationError = validateLineItems(lineItems);
    if (lineItemsValidationError) {
      return res.status(400).json({ error: lineItemsValidationError });
    }

    const updated = await Site.update(id, resolvedSite);

    if (!updated) {
      return res.status(400).json({ error: "Failed to update site" });
    }

    await Site.replaceSiteProducts(id, lineItems, req?.user?.id || null);

    // Handle image uploads if any
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Add image to site_images table
        await Site.addImage(id, `/uploads/site-images/${file.filename}`);
      }
    }

    const updatedSite = await Site.getById(id);

    res.json({
      message: "Site updated successfully",
      site: updatedSite,
    });
  } catch (error) {
    console.error("Update site error:", error);
    res.status(500).json({
      error: "Failed to update site",
      message: error.message,
    });
  }
};

const updateSiteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = ["COMING_SOON", "WORKING", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error:
          "Invalid status. Must be one of: COMING_SOON, WORKING, COMPLETED",
      });
    }

    const updated = await Site.updateStatus(id, status);

    if (!updated) {
      return res.status(404).json({ error: "Site not found" });
    }

    const updatedSite = await Site.getById(id);

    res.json({
      message: "Site status updated successfully",
      site: updatedSite,
    });
  } catch (error) {
    console.error("Update site status error:", error);
    res.status(500).json({
      error: "Failed to update site status",
      message: error.message,
    });
  }
};

const deleteSite = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Site.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Site not found" });
    }

    res.json({
      message: "Site deleted successfully",
    });
  } catch (error) {
    console.error("Delete site error:", error);
    res.status(500).json({
      error: "Failed to delete site",
      message: error.message,
    });
  }
};

const getSitesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ["COMING_SOON", "WORKING", "COMPLETED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const sites = await Site.getByStatus(status);

    res.json({
      message: `Sites with status ${status} retrieved successfully`,
      sites,
    });
  } catch (error) {
    console.error("Get sites by status error:", error);
    res.status(500).json({
      error: "Failed to retrieve sites",
      message: error.message,
    });
  }
};

const getSitesWithImages = async (req, res) => {
  try {
    const sites = await Site.getWithImages();
    res.json({
      message: "Sites with images retrieved successfully",
      sites,
    });
  } catch (error) {
    console.error("Get sites with images error:", error);
    res.status(500).json({
      error: "Failed to retrieve sites",
      message: error.message,
    });
  }
};

module.exports = {
  getAllSites,
  getSiteById,
  createSite,
  updateSite,
  updateSiteStatus,
  deleteSite,
  getSitesByStatus,
  getSitesWithImages,
};
