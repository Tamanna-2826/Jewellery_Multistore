const { Review,User } = require("../models");

exports.addReview = async (req, res) => {
  const { user_id, product_id, rating, review_text } = req.body;

  try {
    const review = await Review.create({
      user_id,
      product_id,
      rating,
      review_text,
    });
    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the review",
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
