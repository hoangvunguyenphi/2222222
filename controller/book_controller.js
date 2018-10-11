var AWS = require("aws-sdk");
var Cart = require("./cart");
const UUID = require("uuid/v4");
let date = require("date-and-time");
var renameModule = require("../controller/edit_name");
const awsconfig = require("../aws-config.json");
const accessKeyId = awsconfig.AWS.accessKeyId;
const secretAccessKey = awsconfig.AWS.secretAccessKey;
const region = awsconfig.AWS.region;
AWS.config.update({
  accessKeyId,
  secretAccessKey,
  region
});
let docClient = new AWS.DynamoDB.DocumentClient();

//GET ALL BOOK
exports.get_all_book = function (req, res, next) {
  var params = {
    TableName: "DA2Book"
  };
  //DUYET TAT CA COLLECTIONS TREN TABLE
  docClient.scan(params, onScan);

  function onScan(err, data) {
    if (err) {
      console.error(
        "\nUnable to scan the table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.render("error");
    } else {
      data.Items.forEach(function (book) {
        console.log("INITIAL=" + book._bookID);
      });
      //nếu session rỗng
      if (!req.session.cart) {
        return res.render("../views/site/page/home", {
          products: [],
          allBooks: data.Items,
          totalPrice: 0,
          totalQty: 0
        });
      }
      //ngược lại đang trong phiên session
      var cart = new Cart(req.session.cart);
      res.render("../views/site/page/home", {
        allBooks: data.Items,
        products: cart.generateArray(),
        totalPrice: cart.totalPrice,
        totalQty: cart.totalQty
      });
    }
  }
};
//GET ALL BOOK ADMIN
exports.get_all_book2 = function (req, res, next) {
  var params = {
    TableName: "DA2Book"
  };
  docClient.scan(params, onScan);

  function onScan(err, data) {
    if (err) {
      console.error(
        "\nUnable to scan the table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.render("error");
    } else {
      res.render("../views/admin/page/ahome.ejs", {
        allBooks: data.Items
      });
    }
  }
};

//GET CHI TIET SP
exports.get_detail_product = function (req, res, next) {
  var sachID = req.params.id;
  console.log("\n_________" + sachID);

  var params = {
    TableName: "DA2Book",
    KeyConditionExpression: "#ma = :id",
    ExpressionAttributeNames: {
      "#ma": "_bookID"
    },
    ExpressionAttributeValues: {
      ":id": sachID
    }
  };
  //Thực hiện query object theo id lấy từ req.params
  docClient.query(params, function (err, data) {
    if (err) {
      console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
      console.log(data);
      if (!req.session.cart) {
        return res.render("../views/site/page/single-product", {
          sachDetail: data.Items,
          products: [],
          allBooks: data.Items,
          totalPrice: 0,
          totalQty: 0
        });
      }
      var cart = new Cart(req.session.cart);
      res.render("../views/site/page/single-product", {
        sachDetail: data.Items,
        products: cart.generateArray(),
        totalPrice: cart.totalPrice,
        totalQty: cart.totalQty
      });
    }
  });
};

exports.edit_book = function (req, res, next) {
  var bookid = req.params.id;
  console.log(req.body.editTinhTrang);
  var editBook = {
    tacgia: renameModule.splitList(req.body.editTacGia),
    tieude: req.body.editTieuDe,
    theloai: renameModule.splitList(req.body.editTheLoai),
    SKU: req.body.editSKU,
    ngayxuatban: req.body.editNgayXuatBan,
    nhaxuatban: req.body.editNhaXuatBan,
    kichthuoc: req.body.editKichThuoc,
    mota: req.body.editMoTa,
    dichgia: renameModule.splitList(req.body.editDichGia),
    ngonngu: req.body.editNgonNgu,
    tinhtrang: renameModule.splitList(req.body.editTinhTrang) || [],
    danhdau: renameModule.splitList(req.body.editDanhDau) || [],
    linkseo: req.body.editLinkSeo,
    sotrang: parseInt(req.body.editSoTrang),
    gia: parseFloat(req.body.editGia)
  };
  console.log(editBook);
  var params = {
    TableName: "DA2Book",
    Key: {
      _bookID: bookid
    },
    UpdateExpression: "set #sku=:sk, #tieude=:td, #tacgia=:tg, #dichgia=:dg, #theloai=:tl,#tinhtrang=:tt,#ngonngu=:nn,#ngayxuatban=:txb,#nhaxuatban=:nxb,#sotrang=:st,#mota=:mt,#danhdau=:dd,#gia=:g",
    ExpressionAttributeValues: {
      ":sk": editBook.SKU,
      ":td": editBook.tieude,
      ":tg": editBook.tacgia,
      ":dg": editBook.dichgia,
      ":tl": editBook.theloai,
      ":tt": editBook.tinhtrang,
      ":nn": editBook.ngonngu,
      ":txb": editBook.ngayxuatban,
      ":nxb": editBook.nhaxuatban,
      ":st": editBook.sotrang,
      ":mt": editBook.mota,
      ":dd": editBook.danhdau,
      ":g": editBook.gia
    },
    ExpressionAttributeNames: {
      "#sku": "SKU",
      "#tieude": "tieude",
      "#tacgia": "tacgia",
      "#dichgia": "dichgia",
      "#theloai": "theloai",
      "#tinhtrang": "tinhtrang",
      "#ngonngu": "ngonngu",
      "#ngayxuatban": "ngayxuatban",
      "#nhaxuatban": "nhaxuatban",
      "#sotrang": "sotrang",
      "#mota": "mota",
      "#danhdau": "danhdau",
      "#gia": "gia"
    },
    ReturnValues: "UPDATED_NEW"
  };
  docClient.update(params, function (err, data) {
    if (err) {
      console.log("users::update::error - " + JSON.stringify(err, null, 2));
    } else {
      console.log("users::update::success " + JSON.stringify(data));
      res.redirect("/admin");
    }
  });
};

exports.delete_book = function (req, res, next) {
  var bookID = req.params.id;
  console.log("\nRemoved book ID: " + bookID);
  var params = {
    TableName: "DA2Book",
    Key: {
      _bookID: bookID
    }
  };
  docClient.delete(params, function (err, data) {
    if (err) {
      console.log("users::delete::error - " + JSON.stringify(err, null, 2));
    } else {
      console.log("users::delete::success");
      res.redirect("/admin");
    }
  });
};

exports.admin_search_book = function (req, res, next) {
  var keySearch = req.body.txtSearch123123;
  console.log("__" + keySearch);
  if (keySearch.length != 0) {
    var params = {
      TableName: "DA2Book",
      FilterExpression: "contains(#id, :i) or contains(#tieude, :n) ",
      ExpressionAttributeValues: {
        ":i": keySearch,
        ":n": keySearch
      },
      ExpressionAttributeNames: {
        "#tieude": "tieude",
        "#id": "_bookID"
      }
    };

    docClient.scan(params, function (err, data) {
      if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      } else {
        console.log("Query succeeded.");
        console.log(data.Items);
        res.render("../views/admin/page/ahome.ejs", {
          allBooks: data.Items
        });
      }
    });
  } else {
    res.redirect("/admin");
  }
};
// var multer = require("multer");
// var multerS3 = require("multer-s3");
// var path = require("path");
// const mime = require("mime");

// var keyImgUpload = "";
// var s3 = new AWS.S3();
// var upload = multer({
//   limits: {
//     fileSize: 3 * 1024 * 1024
//   },
//   fileFilter: function (req, file, cb) {
//     var filetypes = /jpeg|jpg|png|gif|bmp/;
//     var mimetype = filetypes.test(file.mimetype);
//     var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     if (mimetype && extname) {
//       return cb(null, true);
//     }
//     cb(
//       "Error: File upload only supports the following filetypes - " + filetypes
//     );
//   },
//   storage: multerS3({
//     s3: s3,
//     bucket: "da2-book",
//     metadata: function (req, file, cb) {
//       cb(null, {
//         fieldName: file.originalname
//       });
//     },
//     acl: "public-read",
//     key: function (req, file, cb) {
//       console.log(file);
//       keyImgUpload = UUID() + "." + mime.getExtension(file.mimetype);
//       console.log(keyImgUpload);
//       cb(null, keyImgUpload);
//     }
//   })
// // });
// exports.add_new_book = upload.single("newImgUpload"),
//   function (req, res, next) {
//     var table = "DA2Book";
//     var buket = "da2-book";
//     var now = date.format(new Date(), "DD/MM/YYYY");
//     var url =
//       "https://" + buket + ".s3." + region + ".amazonaws.com/" + keyImgUpload;
//     var params = {
//       TableName: table,
//       Item: {
//         _bookID: UUID(),
//         tieude: req.body.newTieuDe,
//         theloai: req.body.newTheLoai,
//         sotrang: req.body.newSoTrang,
//         SKU: req.body.newSKU,
//         ngayxuatban: req.body.newNgayXuatBan,
//         nhaxuatban: req.body.newNhaXuatBan,
//         kichthuoc: req.body.newKichThuoc,
//         mota: req.body.newMoTa,
//         dichgia: req.body.newDichGia,
//         danhgia: " ",
//         tinhtrang: " ",
//         ngaythem: now.toString,
//         danhdau: req.body.newDanhDau,
//         danhgiasao: " ",
//         linkseo: renameModule.editName(req.body.newTieuDe),
//         sotrang: req.body.newSoTrang,
//         gia: req.body.newGia,
//         hinhanh: url
//       }
//     };
//     console.log(params);
//     res.redirect("/admin");
// docClient.put(params, function (err, data) {
//   if (err) {
//     console.error("Unable to add item. Error JSON:", JSON.stringify(err));
//   } else {
//     res.redirect("/admin");
//   }
// });
//};