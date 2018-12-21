
require('babel-polyfill')

const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', function (accounts) {
  beforeEach(async function () {
    this.contract = await StarNotary.new({ from: accounts[0] })
    if (typeof (web3.version) === 'object') {
      this.web3_version_newer = false
      console.log('old version web3')
    } else {
      this.web3_version_newer = true
      console.log('new version web3')
    }
  })

  describe('can create a star', () => {
    it('can create a star and get its name', async function () {
      await this.contract.createStar('awesome star!', 'this is a test star', '', '', '', '', 1, { from: accounts[0] })
      let info = await this.contract.tokenIdToStarInfo(1)

      assert.equal(info[0], 'awesome star!')

      assert.equal(await this.contract.ownerOf(1), accounts[0])
    })
  })

  describe('buying and selling stars', () => {
    let user1 = accounts[0]
    let user2 = accounts[1]

    let starId = 1
    let starPrice = web3.toWei(0.01, 'ether')
    let gasPrice = web3.toWei(20, 'gwei')

    beforeEach(async function () {
      await this.contract.createStar('awesome star!', 'this is a test star', '', '', '', '', starId, { from: user1 })
    })

    describe('user1 can sell a star', () => {
      it('user1 can put up their star for sale', async function () {
        await this.contract.putStarUpForSale(starId, starPrice, { from: user1 })

        assert.equal(await this.contract.starsForSale(starId), starPrice)
      })

      it('user1 gets the funds after selling a star', async function () {
        let starPrice = web3.toWei(0.05, 'ether')

        await this.contract.putStarUpForSale(starId, starPrice, { from: user1 })

        let balanceOfUser1BeforeTransaction, balanceOfUser1AfterTransaction

        if (this.web3_version_newer) {
          web3.eth.getBalance(user1).then(function (balance) { balanceOfUser1BeforeTransaction = balance })
          await this.contract.buyStar(starId, { from: user2, value: starPrice })
          web3.eth.getBalance(user1).then(function (balance) { balanceOfUser1AfterTransaction = balance })
        } else {
          balanceOfUser1BeforeTransaction = web3.eth.getBalance(user1)
          await this.contract.buyStar(starId, { from: user2, value: starPrice })
          balanceOfUser1AfterTransaction = web3.eth.getBalance(user1)
        }

        assert.equal(balanceOfUser1BeforeTransaction.add(starPrice).toNumber(),
          balanceOfUser1AfterTransaction.toNumber())
      })
    })

    describe('user2 can buy a star that was put up for sale', () => {
      beforeEach(async function () {
        await this.contract.putStarUpForSale(starId, starPrice, { from: user1 })
      })

      it('user2 is the owner of the star after they buy it', async function () {
        await this.contract.buyStar(starId, { from: user2, value: starPrice, gasPrice: gasPrice })
        assert.equal(await this.contract.ownerOf(starId), user2)
      })

      it('user2 ether balance changed correctly', async function () {
        let overpaidAmount = web3.toWei(0.05, 'ether')

        let balanceBeforeTransaction, balanceAfterTransaction

        if (this.web3_version_newer) {
          web3.eth.getBalance(user2).then(function (balance) { balanceBeforeTransaction = balance })
          await this.contract.buyStar(starId, { from: user2, value: overpaidAmount, gasPrice: gasPrice })
          web3.eth.getBalance(user2).then(function (balance) { balanceAfterTransaction = balance })
        } else {
          balanceBeforeTransaction = web3.eth.getBalance(user2)
          await this.contract.buyStar(starId, { from: user2, value: overpaidAmount, gasPrice: gasPrice })
          balanceAfterTransaction = web3.eth.getBalance(user2)
        }
        assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction).toNumber() > starPrice, true)
      })
    })
  })

  describe('check if star exists', () => {
    let user1 = accounts[0]

    let user1Name = 'user1_star'
    let user1Ra = ''
    let user1Story = 'this is a test star'
    let user1Dec = '1.1'
    let user1Mag = '1.1'
    let user1Cen = '1.1'
    let user2Dec = '1.1'
    let user2Mag = '1.1'
    let user2Cen = '1.1'
    let user3Dec = '1.2'
    let user3Mag = '1.2'
    let user3Cen = '1.2'

    let token1 = 1

    beforeEach(async function () {
      await this.contract.createStar(
        user1Name, user1Story, user1Ra, user1Dec, user1Mag, user1Cen, token1, { from: user1 })
    })

    it('coordinator equal check', async function () {
      assert.equal(await this.contract.checkIfStarExist(user2Dec, user2Mag, user2Cen), false)
    })

    it('coordinator unequal check', async function () {
      assert.equal(await this.contract.checkIfStarExist(user3Dec, user3Mag, user3Cen), true)
    })
  })

  describe('get star info by tokenId', () => {
    it('can get star info', async function () {
      await this.contract.createStar(
        'awesome star!', 'this is a test star', '', '', '', '', 1, { from: accounts[0] })
      let info = await this.contract.tokenIdToStarInfo(1)

      assert.equal(info[0], 'awesome star!')
      assert.equal(info[1], 'this is a test star')
      assert.equal(info[2], 'ra_')
      assert.equal(info[3], 'dec_')
      assert.equal(info[4], 'mag_')
      assert.equal(info[5], 'cen_')
    })
  })
})
