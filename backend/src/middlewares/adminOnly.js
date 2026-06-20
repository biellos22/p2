module.exports = (req, res, next) => {
  if (req.userFuncao && req.userFuncao.toLowerCase() === 'admin') {
    return next();
  }
  return res.status(403).json({ 
    msg: "Acesso negado. Esta operação é restrita para administradores." 
  });
};
