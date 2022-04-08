const pagination = (page, totalBoard) => {
  const maxBoard = 10;
  const viewNumber = 5;
  // 페이지 갯수 구하기
  const maxPage = Math.ceil(totalBoard / maxBoard);

  // 스킵할 보드 갯수 구하기
  const skipBoard = maxBoard * (page - 1);

  return { maxPage, skipBoard, maxBoard };
};

module.exports = pagination;
