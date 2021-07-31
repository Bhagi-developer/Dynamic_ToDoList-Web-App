//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

///////////////////////////////////////////
//MONGOOSE CODE START
////////////////////////////////////////////

mongoose.connect("mongodb://localhost:27017/TODOLIST", { useNewUrlParser: true, useUnifiedTopology: true })


//MONGOOSE CONNECTION WITH DATABASE
const listScema = {
  name: {
    type: String,
    required: true
  }
}

const pageSchema = {
  name: String,
  items: [listScema]
}

//MONGOOSE MODEL
const List = mongoose.model("List", listScema);
const Page = mongoose.model("Page", pageSchema);


//MONGOOSE DOCUMENTS
const list1 = new List({
  name: "Get Up Early"
})
const list2 = new List({
  name: "Start PC"
})
const list3 = new List({
  name: "Start code"
})


//MONGOOSE ARRAY
const listArray = [list1, list2, list3];

//MONGOOSE INSERTING ARRAY TO MODEL



/////////////////////////////////////////////
//MONGOOSE STARTING CODE ENDS
////////////////////////////////////////////


app.get("/", function (req, res) {

  List.find({}, function (err, rs) {
    if (err) {
      console.log(err)
    }
    else {
      if (rs.length == 0) {

        List.insertMany(listArray, function (err) {
          if (err) {
            console.log(err);
          }
          else {
            console.log("Default Items Added Successfully!!!")
          }
        })
        res.redirect("/");

      }
      else {
        const day = date.getDate();
        const thisYear = date.getFullYear();
        res.render("list", { listTitle: "Home", today: day, newListItems: rs, year: thisYear });
      }

    }
  })



});

app.post("/", function (req, res) {

  const item = req.body.newItem;
  const headName = req.body.pageName;

  const list = new List({
    name: item
  })

  if (headName == "Home") {
    list.save();
    res.redirect("/");
  }

  else {

    Page.findOne({ name: headName }, function (err, rs) {
      if (!err) {
        rs.items.push(list)
        rs.save();
      }
    })

    res.redirect("/" + headName);
  }
});

app.post("/delete", function (req, res) {

  const knowPage = req.body.pageName;
  const knowId = req.body.listButt;

  if (knowPage !== "Home") {

    Page.findOneAndUpdate(
      { name: knowPage },

      { $pull: { items: { _id: knowId } } },

      function (err, rs) {

        if (!err) {
          res.redirect("/" + knowPage)
        }

      }
    )

  }
  else {

    List.deleteOne({ _id: knowId }, function (err) {

      if (err) {
        console.log(err)
      }
      else {
        console.log("Item deleted from db!!")
      }
    })

    res.redirect("/");

  }





})

app.get("/:topic", function (req, res) {
  const search = _.capitalize(req.params.topic);

  Page.findOne({ name: search }, function (err, rs) {
    if (err) {
      //IF ERROR
      console.log(err)
    }
    else {
      //IF NO ERROR
      if (rs) {

        //ONLY RENDER PAGE
        const day = date.getDate();
        const thisYear = date.getFullYear();
        res.render("list", { listTitle: search, today: day, newListItems: rs.items, year: thisYear })

      }
      else {

        //CREATE AND RENDER PAGE
        const page = new Page({
          name: search,
          items: listArray
        })

        page.save();

        res.redirect("/" + search);


      }

    }
  })
});


app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});


//Copyright claim 2021|| All rights reserved for this source code