
//todo: put cards in winning players pile - done
// push: make it the same deck, new one on refresh - done
// implement war - done
// add reset deck button - done
// format - done-ish

// does weird things at the end of the deck
// if deck is empty, start pulling from player piles
// shuffle player piles



//fetch does weird things with the timing of calling events and stuff in the function, 

document.querySelector('#draw').addEventListener('click', drawTwo)
document.querySelector('#reset').addEventListener('click', resetGame)
document.querySelector('#check-deck').addEventListener('click', listDeck)

let deckID = ''
let player1Pile = 0;
let player2Pile = 0;
// let cardCount = 52;

if(!localStorage.getItem('rememberDeckId')){
  fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
    .then(res => res.json()) // parse response as JSON
    .then(data => {
      deckID = data.deck_id
    })
    .catch(err => {
        console.log(`error ${err}`)
    });
}else{
  deckID = localStorage.getItem('rememberDeckId')
  player1Pile = localStorage.getItem('remP1Pile')
  document.querySelector('#p1Pile').innerText = "Player 1 Pile: " + player1Pile
  player2Pile = localStorage.getItem('remP2Pile')
  document.querySelector('#p2Pile').innerText = "Player 2 Pile: " + player2Pile
}


//draws cards from the initial deck
function drawTwo(){

  // if(cardCount === 0)
  // {
  //   drawPile()
  //   return;
  // }

  const url = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=2`

  fetch(url)
      .then(res => res.json()) // parse response as JSON
      .then(data => {

        flipIt(true)

        console.log(data)
        document.querySelector('#player1').src = data.cards[0].image
        document.querySelector('#player2').src = data.cards[1].image

        let player1Val = convertToNum(data.cards[0].value)
        let player2Val = convertToNum(data.cards[1].value)

        if(player1Val > player2Val){
          document.querySelector('h3').innerText = 'Player 1 Wins the Draw'
          //add to player 1 pile
          addToPile(1, data.cards,2)
        }else if(player1Val < player2Val ){
          document.querySelector('h3').innerText = 'Player 2 Wins the Draw'
          //add to player 2 pile
          addToPile(2, data.cards,2)
        }else{
          document.querySelector('h3').innerText = 'Time for War!'
          //add to war pile?
          goWar(data.cards)
        }

      })
      .catch(err => {
          console.log(`error ${err}`)
      });

      cardCount -= 2

}

function drawPile(){
  // fetch(`https://deckofcardsapi.com/api/deck/${deckID}/pile/player1Pile/`)
  fetch(`https://deckofcardsapi.com/api/deck/${deckID}/pile/player1Pile/draw/?count=1`)
  .then(res => res.json()) // parse response as JSON
  .then(dataPlayer1 => {
    console.log(dataPlayer1)
    fetch(`https://deckofcardsapi.com/api/deck/${deckID}/pile/player2Pile/draw/?count=1`)
    .then(res => res.json()) // parse response as JSON
    .then(dataPlayer2 => {
      console.log(dataPlayer2)
      // let player1Val = convertToNum(dataPlayer1.cards[0].value)
      // let player2Val = convertToNum(dataPlayer2.cards[1].value)

      // if(player1Val > player2Val){
      //   document.querySelector('h3').innerText = 'Player 1 Wins the Draw'
      //   //add to player 1 pile
      //   addToPile(1, data.cards,2)
      // }else if(player1Val < player2Val ){
      //   document.querySelector('h3').innerText = 'Player 2 Wins the Draw'
      //   //add to player 2 pile
      //   addToPile(2, data.cards,2)
      // }else{
      //   document.querySelector('h3').innerText = 'Time for War!'
      //   //add to war pile?
      //   goWar(data.cards)

      // }
    })
      .catch(err => {
        console.log(`error ${err}`)
    });
  })
    .catch(err => {
      console.log(`error ${err}`)
  });
}

function goWar(previousCards){

  // get two cards, compare them, give two extra to winner
  
  const url = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=4`

  fetch(url)

    .then(res => res.json()) // parse response as JSON
    .then(data => {

      document.querySelector('#p1War').src = data.cards[0].image
      document.querySelector('#p2War').src = data.cards[1].image

      flipIt(false)

      let player1Val = convertToNum(data.cards[0].value)
      let player2Val = convertToNum(data.cards[1].value)

      if(player1Val > player2Val){
        document.querySelector('h3').innerText = 'Player 1 Wins the Draw'
        //add winning cards to player 1 pile and 2 face down cards, returns the winner
        addToPile(1, data.cards,4)
        addToPile(1, previousCards,2)
      }else if(player1Val < player2Val ){
        document.querySelector('h3').innerText = 'Player 2 Wins the Draw'
        //add winning cards to player 2 pile and 2 face down cards, returns the winner
        addToPile(2, data.cards,4)
        addToPile(2, previousCards,2)
      }else{
        document.querySelector('h3').innerText = 'Time for War!'
        //add to war pile?

        goWar(data.cards)
    
        document.querySelector('#player1').src = data.cards[0].image
        document.querySelector('#player2').src = data.cards[1].image 
      }

  })
  .catch(err => {
      console.log(`error ${err}`)
  });
}

function convertToNum(val){
  if(val ==='ACE'){
    return 14
  }else if(val ==='KING'){
    return 13
  }else if(val ==='QUEEN'){
    return 12
  }else if(val ==='JACK'){
    return 11
  }else{
    return Number(val)
  }
}

function addToPile(player, cards, indexCount){
  // console.log(cards[0].value)

  if(indexCount ===2){
    fetch(`https://deckofcardsapi.com/api/deck/${deckID}/pile/player${player}Pile/add/?cards=${cards[0].code},${cards[1].code}`)
    .then(res => res.json()) // parse response as JSON
    .then(data => {
      if(player === 1){
        player1Pile = data.piles.player1Pile.remaining
        localStorage.setItem('remP1Pile', player1Pile)
        document.querySelector('#p1Pile').innerText = "Player 1 Pile: " + player1Pile
      }else{
        player2Pile = data.piles.player2Pile.remaining
        localStorage.setItem('remP2Pile', player2Pile)
        document.querySelector('#p2Pile').innerText = "Player 2 Pile: " + player2Pile
      }
    })
    .catch(err => {
        console.log(`error ${err}`)
    });
  }
  else{
    fetch(`https://deckofcardsapi.com/api/deck/${deckID}/pile/player${player}Pile/add/?cards=${cards[0].code},${cards[1].code},${cards[2].code},${cards[3].code}`)
    .then(res => res.json()) // parse response as JSON
    .then(data => {
      if(player === 1){
        player1Pile = data.piles.player1Pile.remaining
        localStorage.setItem('remP1Pile', player1Pile)
        document.querySelector('#p1Pile').innerText = "Player 1 Pile: " + player1Pile
      }else{
        player2Pile = data.piles.player2Pile.remaining
        localStorage.setItem('remP2Pile', player2Pile)
        document.querySelector('#p2Pile').innerText = "Player 2 Pile: " + player2Pile
      }
    })
    .catch(err => {
        console.log(`error ${err}`)
    });
  }

}

function flipIt(doWeWantItHidden){

  if(doWeWantItHidden){
    document.querySelector('#p1War').classList.add('hidden')
    document.querySelector('#p2War').classList.add('hidden')
    document.querySelector('#p1Face-down').classList.add('hidden')
    document.querySelector('#p2Face-down').classList.add('hidden')
  }else{
    document.querySelector('#p1War').classList.remove('hidden')
    document.querySelector('#p2War').classList.remove('hidden')
    document.querySelector('#p1Face-down').classList.remove('hidden')
    document.querySelector('#p2Face-down').classList.remove('hidden')
  }

}

function resetGame(){
  fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
  // fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')

    .then(res => res.json()) // parse response as JSON
    .then(data => {
      deckID = data.deck_id

      flipIt(true)

      localStorage.setItem('rememberDeckId', deckID)

      document.querySelector('#player1').src = 'img/cardBack.jpg'
      document.querySelector('#player2').src = 'img/cardBack.jpg'

      localStorage.setItem('remP1Pile', 0)
      document.querySelector('#p1Pile').innerText = "Player 1 Pile: 0"

      localStorage.setItem('remP2Pile', 0)
      document.querySelector('#p2Pile').innerText = "Player 2 Pile: 0"

    })
    .catch(err => {
        console.log(`error ${err}`)
    });
}

function listDeck(){

  for(let i = 0; i < 2;i++){
    fetch(`https://deckofcardsapi.com/api/deck/<<deck_id>>/pile/<<pile_name>>/list/`)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
    
    
      })
      .catch(err => {
          console.log(`error ${err}`)
      });
  }
}