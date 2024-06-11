const { Review,User } = require("../models");

const addOrUpdateReview = async (req, res) => {
  const { user_id, product_id, ratings, review_text } = req.body;

  try {
    const existingReview = await Review.findOne({
      where: { user_id, product_id },
    });

    if (existingReview) {
      existingReview.ratings = ratings;
      existingReview.review_text = review_text;
      await existingReview.save();

      res.status(200).json({ 
        success: true, 
        message: "Review updated successfully", 
        review: existingReview 
      });
    } else {
      const newReview = await Review.create({
        user_id,
        product_id,
        ratings,
        review_text,
      });
      res.status(201).json({ success: true, review: newReview });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while adding or updating the review",
      error,
    });
  }
};
const getProductReviews = async (req, res) => {
  const { product_id } = req.params;

  try {
    const reviews = await Review.findAll({
      where: { product_id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["first_name", "last_name"],
        },      
      ],
    });
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the reviews",
      error,
    });
  }
};
const getUserProductReviews = async (req, res) => {
  const { user_id,product_ids } = req.body; 

  try {
    const reviews = await Review.findAll({
      where: {
        user_id,
        product_id: product_ids,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["first_name", "last_name"],
        },
      ],
    });

    // Create a map of product_id to review
    const reviewsMap = reviews.reduce((acc, review) => {
      acc[review.product_id] = review;
      return acc;
    }, {});

    // Create a response for each product_id
    const response = product_ids.map(product_id => {
      if (reviewsMap[product_id]) {
        return {
          product_id,
          review: reviewsMap[product_id],
        };
      } else {
        return {
          product_id,
          review: "No review found",
        };
      }
    });

    res.status(200).json({ success: true, reviews: response });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the reviews",
      error,
    });
  }
};

module.exports = { addOrUpdateReview, getProductReviews, getUserProductReviews };
