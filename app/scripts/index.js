// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'
import { default as truffleConfig } from '../../truffle.js'

// Import our contract artifacts and turn them into usable abstractions.
import StarNotaryArtifact from '../../build/contracts/StarNotary.json'

var StarNotary = contract(StarNotaryArtifact)

let accounts
let account

const App = {
  start: function () {
    // Bootstrap the MetaCoin abstraction for Use.
    StarNotary.setProvider(web3.currentProvider)
    StarNotary = StarNotary.at("0x8b4b307bd0d03c94f8f094d8bf1114665a2cfd4c")
    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert('There was an error fetching your accounts.')
        return
      }

      if (accs.length === 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
        return
      }

      accounts = accs
      account = accounts[0]
    })
  },
  claimButtonClicked:function () {
    // star properties
    let name, story, dec, cen, mag, ra
    // get star property value
    name = document.getElementById('star-name').value
    story = document.getElementById('star-story').value
    ra = document.getElementById('star-ra').value
    dec = document.getElementById('star-dec').value
    cen = document.getElementById('star-cen').value
    mag = document.getElementById('star-mag').value

    document.getElementById('star-owner').innerText = ''
    document.getElementById('errorcode').innerText = ''

    StarNotary.lastId().then(function (id) {
      let tokenId = id.toNumber() + 1
      console.log(tokenId)
      return StarNotary.createStar(name, story, ra, dec, mag, cen, tokenId, { from : account, gas : 3141592 })
    }).then(function (tx) {
      console.log(tx)
      let id = tx.logs[0].args.tokenId.toNumber()
      // output the created star ID
      document.getElementById('star-id').innerText = id
      return StarNotary.ownerOf(id)
    }, function (err) {
      console.log(err)
      throw err
    }).then(function (address) {
      if (address === 'undefined') address = 'owner get false'
      document.getElementById('star-owner').innerText = address
      document.getElementById('errorcode').innerText = 'Claimed Success'
    }).catch(function (err) {
      document.getElementById('errorcode').innerText = err
    })
  },
  tokenIdToStarInfo:function () {
    let id = document.getElementById('star-id').value
    console.log(id)
    if (id) {
      id = Number(id)

      document.getElementById('errorcode').innerText = ''
      StarNotary.tokenIdToStarInfo(Number(id)).then(function (info) {
        document.getElementById('star-name').innerText = info[0]
        document.getElementById('star-story').innerText = info[1]
        document.getElementById('star-ra').innerText = info[2]
        document.getElementById('star-dec').innerText = info[3]
        document.getElementById('star-mag').innerText = info[4]
        document.getElementById('star-cen').innerText = info[5]
      }, function (err) {
        document.getElementById('errorcode').innerText = err
      })
    } else {
      document.getElementById('errorcode').innerText = 'id not defined'
    }
  },
  saleStar:function () {
    let id = document.getElementById('star-id').value
    let starPrice = document.getElementById('star-price').value
    console.log(id)
    console.log(starPrice)

    starPrice = web3.toWei(Number(starPrice), 'ether')

    console.log(starPrice)

    document.getElementById('errorcode').innerText = ''
    if (id) {
      id = Number(id)

      StarNotary.putStarUpForSale(Number(id), starPrice, { from:account, gas:3141592 })
      .then(function () {
        document.getElementById('errorcode').innerText = 'success to sale star of id ' + id
      }, function (err) {
        document.getElementById('errorcode').innerText = err
      })
    } else {
      document.getElementById('errorcode').innerText = 'id not defined'
    }
  },
  buStar:function () {
    // ~todo buy a star
  },
  salesList:function () {
    // ~todo get sales list
    // let meta
    // StarNotary.deployed().then(function (instance) {
    //   document.getElementById('errorcode').innerText = ''
    //   meta = instance
    // }).then(function () {

    // }, function (err) {
    //   document.getElementById('errorcode').innerText = err
    // })
  }

}

window.App = App

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined' && web3.currentProvider.selectedAddress) {
    console.log('metamask provider')
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    if (truffleConfig.currentNetwork === 'rinkeby') {
      console.log('rinkeby provider')
      // rinkeyby environment
      window.web3 = new Web3(truffleConfig.networks.rinkeby.provider())
    } else {
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      console.log('localhost provider')
      window.web3 = new Web3(
        new Web3.providers.HttpProvider('http://127.0.0.1:' + truffleConfig.networks.development.port))
    }
  }

  App.start()

  // set info.html id
  let id = getQueryString('id')
  if (id) {
    document.getElementById('star-id').value = id
    App.tokenIdToStarInfo()
  }
})

// functions

function getQueryString (name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
  var r = window.location.search.substr(1).match(reg) // 获取url中"?"符后的字符串并正则匹配
  var context = ''
  if (r != null) { context = r[2] }
  reg = null
  r = null
  return context == null || context === '' || context === 'undefined' ? '' : context
}
