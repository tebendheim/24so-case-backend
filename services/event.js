const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/", (req, res) => {
  db.any("SELECT id, INITCAP(name) AS name FROM event ORDER BY name ASC").then(
    (data) => {
      res.json(data);
    }
  );
});

router.get("/:id", (req, res) => {
  db.any("SELECT * FROM event WHERE id=$1", [req.params.id]).then((data) => {
    console.log(data);
    res.status(200).json(data);
  });
});

router.post("/", async (req, res) => {
  const { name } = req.body;

  try {
    await db.none("INSERT INTO event (name) VALUES ($1)", [name]);
    const data = await db.any("SELECT * from event");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ err: err });
  }
});

router.post("/delete", async (req, res) => {
  const { name } = req.body;
  try {
    await db.none("DELETE FROM event WHERE name=$1", [name]);
    const data = await db.any("SELECT * FROM event");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ err: err });
  }
});

router.post("/deleteall", async (req, res) => {
  const { name } = req.body;
  try {
    const data = await db.tx(async (t) => {
      await t.none(
        "DELETE FROM participate WHERE event_id IN (SELECT id FROM event WHERE name=$1);",
        [name]
      );
      await t.none("DELETE FROM event WHERE name=$1", [name]);
      const d = await t.any("SELECT * FROM event");
      return d;
    });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ err: err });
  }
});

module.exports = router;
