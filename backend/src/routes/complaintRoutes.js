import express from "express";
import { body } from "express-validator";
import {
  addComplaint,
  deleteComplaint,
  getComplaintById,
  getComplaints,
  searchByLocation,
  updateComplaintStatus
} from "../controllers/complaintController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../validators/validate.js";

const router = express.Router();

const complaintValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("title").trim().notEmpty().withMessage("Complaint title is required"),
  body("description").trim().isLength({ min: 10 }).withMessage("Description is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("location").trim().notEmpty().withMessage("Location is required")
];

router.get("/search", protect, searchByLocation);
router.route("/").post(protect, complaintValidation, validate, addComplaint).get(protect, getComplaints);
router.route("/:id").get(protect, getComplaintById).put(protect, updateComplaintStatus).delete(protect, deleteComplaint);

export default router;
