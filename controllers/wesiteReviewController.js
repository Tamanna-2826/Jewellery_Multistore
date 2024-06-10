const { WebsiteReview, User } = require("../models");

const addWebsiteReview = async (req, res) => {
  try {
    const { user_id, ratings, review_text } = req.body;
    const newReview = await WebsiteReview.create({
      user_id,
      ratings,
      review_text,
      status: "pending",
    });
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateReviewStatus = async (req, res) => {
  try {
    const { review_id } = req.params;
    const { status } = req.body;

    const review = await WebsiteReview.findByPk(review_id);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    review.status = status;
    await review.save();

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getApprovedReviews = async (req, res) => {
  try {
    const approvedReviews = await WebsiteReview.findAll({
      where: { status: "approved" },
      include: [
        {
          model: User,
          attributes: ['first_name', 'last_name'],
        },
      ],
    });
    res.status(200).json(approvedReviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPendingReviews = async (req, res) => {
  try {
    const pendingReviews = await WebsiteReview.findAll({
      where: { status: "pending" },
      include: [
        {
          model: User,
          attributes: ['first_name', 'last_name'],
        },
      ],
    });
    res.status(200).json(pendingReviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRejectedReviews = async (req, res) => {
  try {
    const rejectedReviews = await WebsiteReview.findAll({
      where: { status: "reject" },
      include: [
        {
          model: User,
          attributes: ['first_name', 'last_name'],
        },
      ],
    });
    res.status(200).json(rejectedReviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addWebsiteReview,
  updateReviewStatus,
  getPendingReviews,
  getApprovedReviews,
  getRejectedReviews,
};
