const pagination = (page, totalBoard) => {
  const maxBoard = 10;
  let currPage = parseInt(page);
  const viewPage = 5;
  const maxPage = Math.ceil(totalBoard / maxBoard);
  const skipBoard = maxBoard * (page - 1);

  if (currPage > maxPage) {
    currPage = maxPage;
  }

  const startPage = Math.floor((currPage - 1) / viewPage) * viewPage + 1;

  const pageNums = Array(viewPage)
    .fill()
    .map((_, i) => i + startPage);

  return { maxPage, skipBoard, maxBoard, pageNums };
};

module.exports = pagination;
