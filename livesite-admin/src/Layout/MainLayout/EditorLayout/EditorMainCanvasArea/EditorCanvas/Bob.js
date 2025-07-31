import createId from "../../../../../Common/Constants/CreateId";

// bob.js
class Bob {
  constructor(
    userId,
    currentCategory,
    currentSubCategory,
    selectedDate,
    shapeType
  ) {
    this.commonProps = {
      ID: createId(),
      UserID: parseInt(userId),
      AssignDate: selectedDate,
      CategoryID: currentCategory || 1,
      SubCategoryID: currentSubCategory || 1,
      title: null,
      shapeType,
    };
  }
}

export default Bob;
