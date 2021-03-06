const Book = require('../models/book')
const Author = require('../models/author')

const validator = require('express-validator')

exports.authorList = function (req, res, next) {
  Author.find()
    .sort([['familyName', 'ascending']])
    .exec()
    .then((listOfAuthors) => {
      const results = { authorList: listOfAuthors }
      res.render('author-list', results)
    })
    .catch((err) => {
      return next(err)
    })
}

exports.authorDetail = function (req, res, next) {
  const author = Author.findById(req.params.id).exec()

  const books = Book.find({ author: req.params.id }).exec()

  Promise.all([author, books])
    .then((results) => {
      const author = results[0]
      const books = results[1]
      if (!author) {
        const err = new Error('author not found')
        err.status = 404
        return next(err)
      }
      const data = {
        author,
        books
      }
      res.render('author-detail', data)
    })
    .catch((error) => {
      next(error)
    })
}

exports.authorAddForm = function (req, res, next) {
  const data = {
    title: 'Add Author',
    btnLabel: 'Add'
  }
  res.render('author-form', data)
}

exports.authorAddPost = [
  validator.check('firstName', 'Author first name must not be empty.').isLength({ min: 1 }).trim(),
  validator.check('familyName', 'Author family name must not be empty.').isLength({ min: 1 }).trim(),
  validator.check('dateOfBirth', 'Invalid Date').optional({ checkFalsy: true }).isISO8601(),
  validator.check('dateOfDeath', 'Invalid Date').optional({ checkFalsy: true }).isISO8601(),

  validator.sanitizeBody('*').escape(),

  (req, res, next) => {
    const errors = validator.validationResult(req)

    const author = new Author(
      {
        firstName: req.body.firstName,
        familyName: req.body.familyName,
        dateOfBirth: req.body.dateOfBirth,
        dateOfDeath: req.body.dateOfDeath
      }
    )

    if (!errors.isEmpty()) {
      res.redirect('/catalog/author/add')
    } else {
      Author.findById(req.params.id)
        .exec(function (err, foundAuthor) {
          if (err) { return next(err) }

          if (foundAuthor) {
            res.redirect(foundAuthor.url)
          } else {
            author.save(function (err) {
              if (err) { return next(err) }
              res.redirect(author.url)
            })
          }
        })
    }
  }
]

exports.deleteAuthorGet = function (req, res, next) {
  const author = Author.findById(req.params.id).exec()
  const books = Book.find({ author: req.params.id }).exec()

  Promise.all([author, books])
    .then((results) => {
      const author = results[0]
      const books = results[1]

      if (author === null) {
        res.redirect('/catalog/author/list')
      }

      const data = {
        title: 'Delete Author',
        author: author,
        books: books
      }
      res.render('author-delete', data)
    })
    .catch((error) => {
      next(error)
    })
}

exports.deleteAuthorPost = function (req, res, next) {
  Author.findById(req.params.id)
    .exec()

    .then((results) => {
      const author = results

      if (author == null) {
        res.redirect('/catalog/author/list')
      } else {
        Author.findByIdAndRemove(author, function deleteAuthor (err) {
          if (err) {
            return next(err)
          }
          res.redirect('/catalog/author/list')
        })
      }
    })
    .catch((error) => {
      next(error)
    })
}

exports.updateAuthorGet = function (req, res, next) {
  Author.findById(req.params.id).exec()

    .then((results) => {
      const author = results
      if (author === null) {
        res.redirect('/catalog/author/list')
      }
      const data = {
        title: 'Update Author',
        btnLabel: 'Update',
        author: author
      }
      res.render('author-form', data)
    })

    .catch((error) => {
      next(error)
    })
}

exports.updateAuthorPost = [
  validator.check('firstName', 'Author first name must not be empty.').isLength({ min: 1 }).trim(),
  validator.check('familyName', 'Author family name must not be empty.').isLength({ min: 1 }).trim(),
  validator.check('dateOfBirth', 'Invalid Date').optional({ checkFalsy: true }).isISO8601(),
  validator.check('dateOfDeath', 'Invalid Date').optional({ checkFalsy: true }).isISO8601(),

  validator.sanitizeBody('*').escape(),

  (req, res, next) => {
    const errors = validator.validationResult(req)

    const author = new Author(
      {
        firstName: req.body.firstName,
        familyName: req.body.familyName,
        dateOfBirth: req.body.dateOfBirth,
        dateOfDeath: req.body.dateOfDeath,
        _id: req.params.id
      }
    )

    if (!errors.isEmpty()) {
      res.redirect('/catalog/author/add')
    } else {
      Author.findByIdAndUpdate(req.params.id, author, {}, function (err, theauthor) {
        if (err) { return next(err) }
        res.redirect(theauthor.url)
      })
    }
  }

]
