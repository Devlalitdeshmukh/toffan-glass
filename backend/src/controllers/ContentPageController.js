const ContentPage = require("../models/ContentPage");

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
      return res.status(404).json({
        success: false,
        message: "Content page not found",
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
    const { title, content, metaDescription, isActive } = req.body;

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
