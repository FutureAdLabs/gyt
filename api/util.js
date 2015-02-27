var getPointsAndProgressSectionIndex = function(title) {
  var re = /\[\d+\/\d+\]/;

  return title.search(re);
};

var getPointsSectionIndex = function(title) {
  var re = /\[\d+\]/;

  return title.search(re);
};

module.exports.getPointsSectionIndex = getPointsSectionIndex;


module.exports.getNakedTitle = function(title) {

  if(getPointsSectionIndex(title) < 0 && getPointsAndProgressSectionIndex(title) < 0) {
    return title;
  }

  var closeIndex = title.indexOf("]");
  var nakedTitle = title.substring(closeIndex + 2);

  return nakedTitle;
};

module.exports.getCurrentPoints = function(title) {
  var openChar = "";

  if(getPointsSectionIndex(title) >= 0) {
    openChar = "[";
  } else if(getPointsAndProgressSectionIndex(title) >= 0) {
    openChar = "/";
  } else {
    return 0;
  }

  var openIndex = title.indexOf(openChar);
  var closeIndex = title.indexOf("]");
  var pointsStr = title.substring(openIndex + 1, closeIndex);
  var points = parseInt(pointsStr);
  if(!points) {
    points = 0;
  }
  return points;
};

module.exports.getCurrentProgress = function(title) {

  if(getPointsAndProgressSectionIndex(title) < 0) {
    return 0;
  }

  var slashIndex = title.indexOf("/");
  var openIndex = title.indexOf("[");
  var pointsStr = title.substring(openIndex + 1, slashIndex);
  var points = parseInt(pointsStr);
  if(!points) {
    points = 0;
  }
  return points;
};
