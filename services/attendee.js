const express = require("express")
const router = express.Router();
const db = require("../db/db")


router.get("/", (req, res) => {
    db.any('SELECT id, INITCAP(name) as name, phone, age FROM attendee').then(data => {
        res.json(data);
    })   
})

router.post("/", async (req,res) => {
    const {name, phone, age} = req.body;

    try{
        await db.none('INSERT INTO attendee (name, phone, age) VALUES ((LOWER($1)), $2, $3)', [name, phone, age])
        const data = await db.many('SELECT id, INITCAP(name) as name, phone, age FROM attendee')
        res.send(data);
    }catch (err){
        res.status(500);
        res.json({"err": err});
        res.send()
    }
})

router.post("/delete", async(req, res) => {
    const {name, phone} = req.body;
    try{
        await db.none('DELETE FROM attendee WHERE name=(LOWER($1)) AND phone=$2', [name, phone]);
        const data = await db.any('SELECT id, INITCAP(name) as name, phone, age FROM attendee');
        res.status(200).json(data);
    }catch (err){
        res.status(500).json({"err": err});
    }
})

router.post("/deleteid", async(req, res) => {
    const {id} = req.body;
    try{
        await db.none('DELETE FROM attendee WHERE id=$1', [id]);
        const data = await db.any('SELECT id, INITCAP(name) as name, phone, age FROM attendee');
        res.status(200).json(data);
    }catch (err){
        res.status(500).json({"err": err});
    }
})

module.exports = router;