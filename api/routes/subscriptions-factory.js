const { Router } = require('express')
const router = Router()
const hasActiveSubscription = user => user && user.subscription && user.subscription.status === 'active'

module.exports = router

const logger = require('pino')()
const User = require('../models/User')
const Event = require('../models/Event')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const plan = process.env.STRIPE_PLAN || 'pro'

router.post('/subscriptions', async function (req, res) {
  if (!req.user) {
    res.writeHead(401)
    return res.end()
  }
  const { email, token } = req.body
  const { _id: userId } = req.user
  let user = await User.findOne({ _id: userId })

  if (!token) {
    return res.json({ error: 'missing token' })
  }
  if (!email) {
    return res.json({ error: 'missing email' })
  }

  let customer

  const existingUserWithCustomer = await User.findOne({ 'customer.email': email })
  const existingCustomer = existingUserWithCustomer && existingUserWithCustomer.customer

  if (existingCustomer) {
    logger.info('retrieving exinsting customer from stripe', { customerId: existingCustomer.id, userId, email, token })

    const [customerError, _customer] = await getExistingCustomer(existingCustomer.id, user)
    if (customerError) {
      logger.error(customerError)
      await Event.insert({ name: 'getExistingCustomerFailed', createdAt: new Date(), user, email, customerError }).catch(Function.prototype)
      return res.json({ error: 'error-retrieving-existing-customer' })
    }
    customer = _customer
    logger.info('  customer retrieved', customer, userId, email)
    await Event.insert({ name: 'getExistingCustomerSucceeded', createdAt: new Date(), user, email, customer }).catch(Function.prototype)
  } else {
    logger.info('createSubscription userId, email, token', userId, email, token)

    const [customerError, _customer] = await createCustomer(email, token, user)
    if (customerError) {
      logger.error(customerError)
      await Event.insert({ name: 'createCustomerFailed', createdAt: new Date(), user, email, customerError }).catch(Function.prototype)
      return res.json({ error: 'create-customer-failed' })
    }
    customer = _customer
    logger.info('  customer created', customer, userId, email)
    await Event.insert({ name: 'createCustomerSucceeded', createdAt: new Date(), user, email, customer }).catch(Function.prototype)
  }

  logger.info('have customer', JSON.stringify(customer))

  const [subscriptionError, subscription] = await createSubscription(customer.id, user)
  if (subscriptionError) {
    logger.error(subscriptionError)
    await Event.insert({ name: 'createSubscriptionFailed', createdAt: new Date(), user, email, subscriptionError }).catch(Function.prototype)
    return res.json({ error: 'create-subscription-failed' })
  }
  logger.info('  subscription created', subscription, userId, email)
  await Event.insert({ name: 'createSubscriptionSucceeded', createdAt: new Date(), user, email, customer, subscription }).catch(Function.prototype)

  user = await User.findOneAndUpdate({ _id: userId }, { $set: { updatedAt: new Date(), customer, customerUpdatedAt: new Date(), subscription, subscriptionUpdatedAt: new Date() } }, { new: true })

  Object.assign(user, { hasActiveSubscription: hasActiveSubscription(user) })
  Object.assign(req.session.passport.user, user)

  req.session.save()

  return res.json({ message: 'create-subscription-succeeded', user })
})

router.delete('/subscriptions', async function (req, res) {
  if (!req.user) {
    res.writeHead(401)
    return res.end()
  }

  const { _id: userId } = req.user
  let user = await User.findOne({ _id: userId })

  if (!user.subscription && !user.subscription.id) {
    return res.json({ error: 'no-subscription' })
  }

  logger.info('cancelSubscription userId', userId)

  const [subscriptionError, subscription] = await cancelSubscription(user.subscription.id, user)
  if (subscriptionError) {
    logger.error(subscriptionError)
    await Event.insert({ name: 'cancelSubscriptionFailed', createdAt: new Date(), user, subscriptionError }).catch(Function.prototype)
    return res.json({ error: 'cancel-subscription-failed' })
  }
  logger.info('  subscription canceld', subscription, userId)
  await Event.insert({ name: 'cancelSubscriptionSucceeded', createdAt: new Date(), user, subscription }).catch(Function.prototype)

  user = await User.findOneAndUpdate({ _id: userId }, { $set: { updatedAt: new Date(), subscription, subscriptionUpdatedAt: new Date() } }, { new: true })

  Object.assign(user, { hasActiveSubscription: hasActiveSubscription(user) })
  Object.assign(req.session.passport.user, user)

  req.session.save()

  return res.json({ message: 'cancel-subscription-succeeded', user })
})

async function createCustomer (email, source, user) {
  process.nextTick(() => {
    Event.insert({ name: 'createCustomer', createdAt: new Date(), user, email, source }).catch(Function.prototype)
  })

  try {
    const res = await stripe.customers.create({ email, source })
    return [null, res]
  } catch (err) {
    return [err]
  }
}

async function getExistingCustomer (customerId, source, user) {
  process.nextTick(() => {
    Event.insert({ name: 'getExistingCustomer', createdAt: new Date(), customerId, source }).catch(Function.prototype)
  })

  try {
    const res = await stripe.customers.retrieve(customerId)
    return [null, res]
  } catch (err) {
    return [err]
  }
}

async function createSubscription (customerId, user) {
  process.nextTick(() => {
    Event.insert({ name: 'createSubscription', createdAt: new Date(), user, customerId }).catch(Function.prototype)
  })
  try {
    const res = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        plan
      }]
    })
    return [null, res]
  } catch (err) {
    return [err]
  }
}

async function cancelSubscription (subscriptionId, user) {
  process.nextTick(() => {
    Event.insert({ name: 'cancelSubscription', createdAt: new Date(), user, subscriptionId }).catch(Function.prototype)
  })
  try {
    const res = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })

    return [null, res]
  } catch (err) {
    return [err]
  }
}
