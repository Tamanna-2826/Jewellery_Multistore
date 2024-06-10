const { Review,User } = require("../models");

exports.addOrUpdateReview = async (req, res) => {
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

exports.getProductReviews = async (req, res) => {
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
