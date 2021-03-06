'use strict'

const moment = require('moment')
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const AuthorSchema = new Schema(
  {
    firstName: { type: String, required: true, max: 100 },
    familyName: { type: String, required: true, max: 100 },
    dateOfBirth: { type: Date },
    dateOfDeath: { type: Date }
  }
)

// Virtual for author's full name
AuthorSchema
  .virtual('name')
  .get(function () {
    // To avoid errors in cases where an author does not have either a family name or first name
    // We want to make sure we handle the exception by returning an empty string for that case

    let fullname = ''
    if (this.firstName && this.familyName) {
      fullname = this.familyName + ', ' + this.firstName
    }
    if (!this.firstName || !this.familyName) {
      fullname = ''
    }

    return fullname
  })

// Virtual for author's lifespan
AuthorSchema
  .virtual('lifespan')
  .get(function () {
    if (!this.dateOfDeath) {
      return
    }
    return (this.dateOfDeath.getYear() - this.dateOfBirth.getYear()).toString()
  })

// Virtual for author's URL
AuthorSchema
  .virtual('url')
  .get(function () {
    return '/catalog/author/' + this._id
  })

AuthorSchema
  .virtual('date_of_birth_formatted')
  .get(function () {
    return moment(this.dateOfBirth).format('MMMM Do, YYYY')
  })

AuthorSchema
  .virtual('date_of_death_formatted')
  .get(function () {
    return moment(this.dateOfDeath).format('MMMM Do, YYYY')
  })

// Export model
module.exports = mongoose.model('Author', AuthorSchema)
