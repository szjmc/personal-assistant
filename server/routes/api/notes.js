const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Note = require('../../models/Note');

// @route   GET api/notes
// @desc    获取用户所有笔记
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({
      date: -1
    });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/notes
// @desc    创建笔记
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', '标题是必需的').not().isEmpty(),
      check('content', '内容是必需的').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, tags } = req.body;

    try {
      const newNote = new Note({
        title,
        content,
        category,
        tags,
        user: req.user.id
      });

      const note = await newNote.save();

      res.json(note);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/notes/:id
// @desc    更新笔记
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, content, category, tags } = req.body;

  // 构建笔记对象
  const noteFields = {};
  if (title) noteFields.title = title;
  if (content) noteFields.content = content;
  if (category) noteFields.category = category;
  if (tags) noteFields.tags = tags;

  try {
    let note = await Note.findById(req.params.id);

    if (!note) return res.status(404).json({ msg: '笔记未找到' });

    // 确保用户拥有该笔记
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: '未授权' });
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: noteFields },
      { new: true }
    );

    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/notes/:id
// @desc    删除笔记
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);

    if (!note) return res.status(404).json({ msg: '笔记未找到' });

    // 确保用户拥有该笔记
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: '未授权' });
    }

    await Note.findByIdAndRemove(req.params.id);

    res.json({ msg: '笔记已删除' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;    