const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => { 

    beforeEach(async function() { 
        this.contract = await StarNotary.new({from: accounts[0]})
    })
    
    describe('can create a star', () => { 
        it('can create a star and get its name', async function () { 
            
            await this.contract.createStar('awesome star!','','','','','', 1, {from: accounts[0]})
            let info = await this.contract.tokenIdToStarInfo(1)

            assert.equal(info[0], 'awesome star!')
        })
    })

    describe('buying and selling stars', () => { 
        let user1 = accounts[1]
        let user2 = accounts[2]
        let randomMaliciousUser = accounts[3]
        
        let starId = 1
        let starPrice = web3.toWei(.01, "ether")

        beforeEach(async function () { 
            await this.contract.createStar('awesome star!','','','','','',  starId, {from: user1})    
        })

        it('user1 can put up their star for sale and get price by starId', async function () { 
            assert.equal(await this.contract.ownerOf(starId), user1)
            await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            
            assert.equal(await this.contract.starsForSale(starId), starPrice)
        })

        describe('user2 can buy a star that was put up for sale', () => { 
            beforeEach(async function () { 
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            })

            it('user2 is the owner of the star after they buy it', async function() { 
                await this.contract.buyStar(starId, {from: user2, value: starPrice, gasPrice: 0})
                assert.equal(await this.contract.ownerOf(starId), user2)
            })

            it('user2 ether balance changed correctly', async function () { 
                let overpaidAmount = web3.toWei(.05, 'ether')
                const balanceBeforeTransaction = web3.eth.getBalance(user2)
                await this.contract.buyStar(starId, {from: user2, value: overpaidAmount, gasPrice: 0})
                const balanceAfterTransaction = web3.eth.getBalance(user2)

                assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction), starPrice)
            })
        })
    })

    describe('check if star exists',()=>{
        let user1 = accounts[1]
        let user2 = accounts[2]
        let user3 = accounts[3]

        let user1_name ='user1_star'
        let user1_ra =''
        let user1_story =''
        let user1_dec = '1.1'
        let user1_mag ='1.1'
        let user1_cen ='1.1'
        let user2_dec = '1.1'
        let user2_mag ='1.1'
        let user2_cen ='1.1'
        let user3_dec = '1.2'
        let user3_mag ='1.2'
        let user3_cen ='1.2'

        let token1 = 1

        beforeEach(async function () { 
            await this.contract.createStar(user1_name,user1_story,user1_ra,user1_dec,user1_mag,user1_cen, token1, {from: user1})    
        })

        it('coordinator equal check',async function(){
            assert.equal(await this.contract.checkIfStarExist(user2_dec,user2_mag,user2_cen),false)
        })

        it('coordinator unequal check',async function(){
            assert.equal(await this.contract.checkIfStarExist(user3_dec,user3_mag,user3_cen),true)
        })
    })

    describe('get star info by tokenId',()=>{
        it('can get star info', async function () { 
            
            await this.contract.createStar('awesome star!','','','','','', 1, {from: accounts[0]})
            let info = await this.contract.tokenIdToStarInfo(1)

            assert.equal(info[0], 'awesome star!')
            assert.equal(info[1], '')
            assert.equal(info[2], 'ra_')
            assert.equal(info[3], 'dec_')
            assert.equal(info[4], 'mag_')
            assert.equal(info[5], 'cen_')
        })
    })
})