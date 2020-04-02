const Photo = require('../models/photo.model');
const Voter = require('../models/Voter.model');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {
  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    if (title && author && email && file) {
      // if fields are not empty...
      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExt = fileName.split('.').slice(-1)[0];
      const emailPattern = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
      if (
        (fileExt === 'jpg' || fileExt === 'png' || fileExt === 'gif') &&
        title.length < 25 &&
        author.length < 50 &&
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) &&
        !/<\/?[a-z][\s\S]*>/i.test(title)
      ) {
        const newPhoto = new Photo({
          title,
          author,
          email,
          src: fileName,
          votes: 0
        });
        await newPhoto.save(); // ...save new photo in DB
        res.json(newPhoto);
      } else {
        throw new Error('Wrong input!');
      }
    } else {
      throw new Error('Wrong input!');
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {
  try {
    res.json(await Photo.find());
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {
  try {
    const voter = await Voter.findOne({ user: req.clientIp });
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    console.log(voter);
    if (!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      if (voter) {
        if (voter.votes.includes(photoToUpdate._id)) {
          res.status(500).json(err);
        } else {
          voter.votes.push(photoToUpdate._id);
          photoToUpdate.votes++;
          photoToUpdate.save();
          res.send({ message: 'OK' });
        }
      } else {
        const newVoter = new Voter({
          user: req.clientIp,
          votes: [photoToUpdate._id]
        });
        await newVoter.save();
        photoToUpdate.votes++;
        photoToUpdate.save();
        res.send({ message: 'OK' });
      }
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
