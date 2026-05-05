const Document = require("../models/Document");

const createDocument = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const document = await Document.create({
      title,
      content: content || "",
      owner: req.user.id,
    });

    res.status(201).json({
      message: "Document created successfully",
      document,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      owner: req.user.id,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user.id,
      isDeleted: false,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const updateDocument = async (req, res) => {
  try {
    const { title, content } = req.body;

    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user.id,
      isDeleted: false,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (title !== undefined) document.title = title;
    if (content !== undefined) document.content = content;

    await document.save();

    res.status(200).json({
      message: "Document updated successfully",
      document,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user.id,
      isDeleted: false,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    document.isDeleted = true;
    await document.save();

    res.status(200).json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
};