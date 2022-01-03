exports.success = (res, statusCode, data, results) => {
  let status;
  statusCode.startsWith("2") ? (status = "sucesss") : (status = "failed");
  statusCode * 1;
  if (results) {
    return res.status(statusCode).json({
      status: status,
      results: data.length,
      data: { data },
    });
  }
  return res.status(statusCode).json({
    status: status,
    data: { data },
  });
};

// exports.failure = (res, statusCode, message) => {
//   const status = "failed";
//   return res.status(statusCode).json({
//     status: status,
//     message: message,
//   });
// };
