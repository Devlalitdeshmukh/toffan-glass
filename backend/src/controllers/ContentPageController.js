const ContentPage = require("../models/ContentPage");
const fs = require("fs");
const path = require("path");

const normalizeExistingImages = (existingImages) => {
  if (Array.isArray(existingImages)) {
    return existingImages
      .map((img) => (typeof img === "string" ? img.trim() : ""))
      .filter(Boolean);
  }

  if (typeof existingImages === "string") {
    const trimmed = existingImages.trim();
    if (!trimmed) return [];
    return trimmed
      .split(",")
      .map((img) => img.trim())
      .filter(Boolean);
  }

  return null;
};

const deleteLocalImageFile = (imageUrl) => {
  if (typeof imageUrl !== "string" || !imageUrl.startsWith("/uploads/")) return;
  const absolutePath = path.join(__dirname, "../..", imageUrl.replace(/^\/+/, ""));
  if (!fs.existsSync(absolutePath)) return;
  fs.unlink(absolutePath, (err) => {
    if (err) {
      console.error("Failed to delete content page image file:", absolutePath, err.message);
    }
  });
};

const getAllContentPages = async (req, res) => {
  try {
    const contentPages = await ContentPage.getAll();
    res.json({
      success: true,
      data: contentPages,
    });
  } catch (error) {
    console.error("Error fetching content pages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch content pages",
      error: error.message,
    });
  }
};

const getContentPageByPageName = async (req, res) => {
  try {
    const { pageName } = req.params;
    const contentPage = await ContentPage.getByPageName(pageName);

    if (!contentPage) {
      return res.status(200).json({
        success: true,
        message: "Content page not found",
        data: null,
      });
    }

    res.json({
      success: true,
      data: contentPage,
    });
  } catch (error) {
    console.error("Error fetching content page:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch content page",
      error: error.message,
    });
  }
};

const createContentPage = async (req, res) => {
  try {
    const { pageName, title, content, metaDescription, isActive } = req.body;

    // Validate required fields
    if (!pageName || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "Page name, title, and content are required",
      });
    }

    const newContentPage = await ContentPage.create({
      pageName,
      title,
      content,
      metaDescription: metaDescription || "",
      isActive: isActive !== undefined ? isActive : true,
    });

    // Handle image uploads if any
    if (req.files && req.files.length > 0) {
      // Get the content page ID by fetching it again
      const createdPage = await ContentPage.getByPageName(pageName);
      if (createdPage) {
        for (const file of req.files) {
          // Add image to content_page_images table
          await ContentPage.addImageToPage(
            createdPage.id,
            `/uploads/content-page-images/${file.filename}`,
          );
        }
      }
    }

    res.status(201).json({
      success: true,
      message: "Content page created successfully",
      data: newContentPage,
    });
  } catch (error) {
    console.error("Error creating content page:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create content page",
      error: error.message,
    });
  }
};

const updateContentPage = async (req, res) => {
  try {
    const { pageName } = req.params;
    const { title, content, metaDescription, isActive, existingImages } = req.body;

    // Handle specifications if it's sent as a string
    let parsedMetaDesc = metaDescription;
    if (typeof metaDescription === "string") {
      try {
        parsedMetaDesc = JSON.parse(metaDescription);
      } catch (e) {
        // If parsing fails, keep original value
      }
    }

    // Check if content page exists
    const existingPage = await ContentPage.getByPageName(pageName);
    if (!existingPage) {
      return res.status(404).json({
        success: false,
        message: "Content page not found",
      });
    }

    const updatedContentPage = await ContentPage.update(pageName, {
      title,
      content,
      metaDescription: parsedMetaDesc,
      isActive,
    });

    const keepImages = normalizeExistingImages(existingImages);
    if (keepImages !== null) {
      const currentImages = await ContentPage.getImagesByPageId(existingPage.id);
      const keepSet = new Set(keepImages);
      const imagesToDelete = currentImages
        .map((img) => img.imageUrl)
        .filter((url) => !keepSet.has(url));

      if (imagesToDelete.length > 0) {
        await ContentPage.deleteImagesByUrls(existingPage.id, imagesToDelete);
        imagesToDelete.forEach(deleteLocalImageFile);
      }
    }

    // Handle image uploads if any
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Add image to content_page_images table
        await ContentPage.addImageToPage(
          existingPage.id,
          `/uploads/content-page-images/${file.filename}`,
        );
      }
    }

    res.json({
      success: true,
      message: "Content page updated successfully",
      data: updatedContentPage,
    });
  } catch (error) {
    console.error("Error updating content page:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update content page",
      error: error.message,
    });
  }
};

const deleteContentPage = async (req, res) => {
  try {
    const { pageName } = req.params;

    // Check if content page exists
    const existingPage = await ContentPage.getByPageName(pageName);
    if (!existingPage) {
      return res.status(404).json({
        success: false,
        message: "Content page not found",
      });
    }

    await ContentPage.delete(pageName);

    res.json({
      success: true,
      message: "Content page deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting content page:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete content page",
      error: error.message,
    });
  }
};

module.exports = {
  getAllContentPages,
  getContentPageByPageName,
  createContentPage,
  updateContentPage,
  deleteContentPage,
};
