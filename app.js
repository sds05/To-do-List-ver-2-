//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.connect('mongodb+srv://admin-sneha:Sneha2023@cluster0.czckes8.mongodb.net/todolistDB');



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//creating database

const itemsSchema = new mongoose.Schema({
  name:String
 });

 //creating collection
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"Welcome!"
});

const item2 = new Item({
  name:"Click + button to add new items"
});

const item3 = new Item({
  name:"Click on the square box to delete items"
});

const itemsDefault = [item1,item2,item3];

//for customList

const customListSchema = new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});

const Customitem = mongoose.model("Customitem",customListSchema);

// *-*-*-*-*-

app.get("/", function(req, res) {

   Item.find()
  // if there are documents returned from the find query, console log the documents
  .then(function (items) {

    if(items.length === 0){
      Item.insertMany(itemsDefault)
        {
          console.log("Successfully added default items");
        }
    }
    res.render("list", {listTitle: "Today", newListItems: items});
  })
  // if there is any error, console lgo the error
  .catch(function (err) {
    console.log(err);
  })
});

// *-*-*-*-*-

app.get("/:customList",function(req,res){
  const customList_name = _.capitalize(req.params.customList);   // capatilize all custom list name

  Customitem.findOne({'name':customList_name})
    .then(function(result) {
            if(!result){
              const customList = new Customitem({
              name:customList_name,
              items:itemsDefault
              });
              // save the item into collection
              customList.save();
              // to show the new list on the screen
              res.redirect("/"+customList_name);
            }
            else{
              res.render("list", {listTitle: result.name, newListItems: result.items});
            }
             
    });
  
});

// *-*-*-*-*-

app.post("/", function(req, res){

  const userItem = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name:userItem
  });

  if(listName == "Today"){
    newItem.save();
    res.redirect("/");
  }
  else{
    Customitem.findOne({'name':listName})
    .then(function(result) {
            if(result){
              // add the new item to that list
              result.items.push(newItem); 
              // save the item into collection
              result.save();
              // to show the new list on the screen
              res.redirect("/"+listName);
            }
            
             
    });
  }

  
});

// *-*-*-*-*-

app.post("/delete",function(req,res){
  const checkedItem_id = req.body.checked_item;
  const listname = req.body.listName;

  if(listname == "Today"){
  
     // delete the checked item
    Item.findByIdAndRemove({ _id: checkedItem_id })
    .then(() => {
        console.log("Successfully Deleted");
    })
    .catch((err) => {
        console.log(err);
    });
    res.redirect("/");
  }

  else{
    // finding that item in the array to delete from the requireds collection
    Customitem.findOneAndUpdate({'name':listname},{$pull:{items:{_id:checkedItem_id}}})
    .then(function(result) {
            if(result){
              console.log("Successfully Deleted");
              res.redirect("/"+listname);
            }
            
    });
   
  }

  
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
