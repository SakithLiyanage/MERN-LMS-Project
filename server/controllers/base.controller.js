/**
 * Base controller with common functionality for content controllers
 */

exports.getAll = (Model) => async (req, res) => {
  try {
    console.log(`Fetching all ${Model.modelName} with query:`, req.query);
    
    let query = {};
    
    // Handle courseId from query params
    if (req.query.courseId) {
      query.courseId = req.query.courseId;
    }
    
    // Handle courseId from URL params (for /course/:courseId routes)
    if (req.params.courseId) {
      query.courseId = req.params.courseId;
    }
    
    console.log(`Final query for ${Model.modelName}:`, query);
    
    const items = await Model.find(query)
      .populate('courseId')
      .populate('author', 'name email role')
      .sort('-createdAt');
    
    console.log(`Found ${items.length} ${Model.modelName} items`);
    
    return res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error(`Error fetching ${Model.modelName}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getById = (Model) => async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching ${Model.modelName} with ID: ${id}`);
    
    const item = await Model.findById(id)
      .populate('courseId')
      .populate('author', 'name email role');
    
    if (!item) {
      console.log(`${Model.modelName} not found with ID ${id}`);
      return res.status(404).json({
        success: false,
        message: `${Model.modelName} not found`
      });
    }
    
    return res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error(`Error fetching ${Model.modelName}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
