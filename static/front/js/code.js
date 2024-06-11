

setInterval(updateGameTime, 1000);
let room_name = window.location.href.split('/')[4]
let in_prison = false
const colors = ['rgba(255, 0, 0, 0.5)', 'green', 'blue', 'yellow', "pink"]
let players_positions = [1,1,1,1,1]
let current_player = 0
let player_number
let player_money
let count_doubles = 0;
let count_roll_in_prison = 0;
let monopoly = []
let companies = []
let pawns = []
let auction_players
let players = []
let game_start = false
const max_players = document.querySelector('.players').children.length
let players_count= max_players;
let round = 0;
let username
let count_deals = 0
let build_allow = true
const monopolies = {
    0: [1,3],
    1: [4,12,28],
    2: [5,15,25,35],
    3: [6,8,9],
    4: [11,13,14],
    5: [16,18,19],
    6: [21,23,24],
    7: [26,27,29],
    8: [31,32,34],
    9: [37,39],
}

const cell_names = []



function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
    }



function absdiv(a,b) {
    let result = a%b
    if (result < 0) result+=b
    return result
}

function update_current_player() {
    let data = {
                'current_player': next_player(),
                'count_doubles':count_doubles
            };
            fetch(`../../api/rooms/${room_name}/`,{
                     method: 'PUT',
                     headers: {
                         'Content-Type': 'application/json',
                         'X-CSRFToken': getCookie('csrftoken')
                     },
                     body: JSON.stringify(data)
                 })
                     .then(response => response.json())
                     .then(data => {
                         console.log(data);
                     })
                     .catch(error => {
                         console.error('Error:', error);
                     });
}

function next_player() {
    let next_current_player = (players.indexOf(current_player)+1)
    if (next_current_player===players_count) {
        endRound()
        round++;
    }
    current_player = players[next_current_player%players_count]
    return current_player
}

function get_cell(cell_pos) {
    return new Promise((resolve, reject) => {
        fetch(`../../api/cells/?room__name=${room_name}&pos=${cell_pos}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            resolve(data[0]);
        })
        .catch(error => {
            console.error('Error:', error);
            reject(error);
        });
    });
}

document.getElementsByClassName('close')[0].addEventListener('click', function() {
    document.getElementById('myModal').style.display = 'none';
    document.getElementById('myModal2').style.display = 'none';
});

function formatTime(time) {
    return String(time).padStart(2, '0');
}
let seconds = 0;
let minutes = 0;
let hours = 0;
function updateGameTime() {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
            if (hours >= 24) {
                hours = 0;
            }
        }
    }
    document.getElementById('gameTime').innerHTML = formatTime(hours) + ':' + formatTime(minutes) + ':' + formatTime(seconds);
}

document.querySelectorAll('.player').forEach(function(element) {
    element.addEventListener('click', function() {
        element.children[4].style.display = 'block';
         if (element.children[4].children[0].style.display==='block' || parseInt(element.id.slice(6))===player_number || player_number!==current_player || count_deals===3){
             element.children[4].children[0].style.display='none'
         }
        else{
            element.children[4].children[0].style.display = 'block';
            element.children[4].children[0].addEventListener('click', openModalDeal)
         }
        if (element.children[4].children[1].style.display==='none' && parseInt(element.id.slice(6))===player_number && player_number===current_player) {
            element.children[4].children[1].style.display='block'
            element.children[4].children[1].addEventListener('click', openModalBankrupt)
        }
        else {
            element.children[4].children[1].style.display='none'
        }
    })
})
document.querySelectorAll('.element').forEach(function(element) {
    const id  = parseInt(element.parentElement.id.slice(4))
    element.addEventListener('click', function() {
        if (element.children[0].style.display==='block' || document.getElementById('deal').style.display==='block')
             element.children[0].style.display = 'none';

        else {
           element.children[0].style.display = 'block';
           if (current_player===player_number && parseInt(element.parentElement.title) === player_number) {
              const stars = parseInt(element.children[2].getAttribute("data-stars"));
           const pawn = parseInt(element.getAttribute("data-pawn"));
           let pawn_allow = true;
           if (stars!==5) {
               for (let i of monopoly) {
                   for (let cell of monopolies[i]) {
                       if (parseInt(document.getElementById(`cell${cell}`).children[1].children[2].getAttribute('data-stars'))) {
                           pawn_allow = false;
                       }
                   }
               if (monopolies[i].includes(id) && build_allow && parseInt(player_money.innerText)>= Math.round(250 * id/3 / 100) * 100){

                   function build_click(){
                        element.children[2].setAttribute("data-stars", `${stars+1}` )
                        build_allow = false
                       let data = {
                        room_name: room_name,
                        cell: id
                        };
                fetch('../../game/build/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(data)
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        chatSocket.send(JSON.stringify({
                            'type':'build',
                            'cell':id,
                            'stars': data.stars}));
                        chatSocket.send(JSON.stringify({
                            'type':'chat_message',
                            'message':`Построил филиал компании ${cell_names[id]}`}));
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                    this.removeEventListener('click', build_click)
                   }

                   const build_btn = element.children[0].children[1].children[0]
                   build_btn.style.display = 'block';
                   build_btn.addEventListener('click', build_click)
               }
               else {
                   element.children[0].children[1].children[0].style.display = 'none';
               }

            }
           }
            else {
                element.children[0].children[1].children[0].style.display = 'none';
           }
           if (stars===0 && !pawn && pawn_allow) {
               function pawn_click() {
                   element.setAttribute("data-pawn", `1` )
                       let data = {
                             room_name: room_name,
                             cell: id
                        };
                 chatSocket.send(JSON.stringify({
                    'type':'pawn',
                    'company':id}));
                chatSocket.send(JSON.stringify({
                    'type':'chat_message',
                    'message':`заложил компанию ${cell_names[id]}`}));
                 fetch('../../game/pawn/', {
                     method: 'POST',
                     headers: {
                         'Content-Type': 'application/json',
                         'X-CSRFToken': getCookie('csrftoken')
                     },
                     body: JSON.stringify(data)
                 })
                     .then(response => response.json())
                     .then(data => {
                         console.log(data);
                     })
                     .catch(error => {
                         console.error('Error:', error);
                     });
                 this.removeEventListener('click', pawn_click)
               }
                const pawn_btn = element.children[0].children[1].children[2]
                   pawn_btn.style.display = 'block';
                   pawn_btn.addEventListener('click', pawn_click)
           }
           else {
               element.children[0].children[1].children[2].style.display = 'none';
           }
           if (stars) {
               function sell_click() {
                   element.children[2].setAttribute("data-stars", `${stars-1}` )
                    let data = {
                        room_name: room_name,
                        cell: id
                        };
                fetch('../../game/sell/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(data)
                })
                    .then(response => response.json())
                    .then(data => {
                        // users_update()
                        console.log(data);
                        chatSocket.send(JSON.stringify({
                            'type':'sell',
                            'cell':id,
                            'stars': data.stars}));
                        chatSocket.send(JSON.stringify({
                            'type':'chat_message',
                            'message':`Продаёт филиал компании ${cell_names[id]}`}));
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                this.removeEventListener('click', sell_click)
               }
               const sell_btn = element.children[0].children[1].children[1]
                   sell_btn.style.display = 'block';
                   sell_btn.addEventListener('click', sell_click)
           }
           else {
               element.children[0].children[1].children[1].style.display = 'none';
           }
           if (pawn) {
               function unpawn_click() {
                   element.setAttribute("data-pawn", `0` )
                       let data = {
                        room_name: room_name,
                        cell: id
                     };
                fetch('../../game/unpawn/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(data)
                })
                    .then(response => response.json())
                    .then(data => {
                       chatSocket.send(JSON.stringify({
                    'type':'unpawn',
                    'cell':id}));
                        chatSocket.send(JSON.stringify({
                    'type':'chat_message',
                    'message':`Выкупил компанию ${cell_names[id]}`}));
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                    this.removeEventListener('click', unpawn_click)
               }
                const pawn_btn = element.children[0].children[1].children[3]
                   pawn_btn.style.display = 'block';
                   pawn_btn.addEventListener('click', unpawn_click)
           }
           else {
               element.children[0].children[1].children[3].style.display = 'none';
           }
           }
           else {
               element.children[0].children[1].children[0].style.display = 'none';
               element.children[0].children[1].children[1].style.display = 'none';
               element.children[0].children[1].children[2].style.display = 'none';
                element.children[0].children[1].children[3].style.display = 'none';

           }

        }
    });})
document.addEventListener('click', function(event) {
  const isClickInsidePopup = event.target.classList.contains('element');
  const isClickInsideElement = event.target.classList.contains('popup');
  if (!isClickInsidePopup && !isClickInsideElement) {
    document.querySelectorAll('.popup').forEach(function (el){
        el.style.display = 'none';
    })
  }
  if (!event.target.classList.contains('player')) {
      document.querySelectorAll('.player-popup').forEach(function (el){
        el.style.display = 'none';
    })
  }
});
function endRound() {
    count_deals = 0;
    build_allow = true;
    let Data = {
                room_name: room_name,
                };
            fetch('../../game/end_round/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(Data)
            })
                .then(response => response.json())
                .then(dat => {
                })
                .catch(error => {
                    console.error('Error:', error);
                });
    fetch(`../../api/cells/?current_cost=0&room__name=${room_name}`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }})
    .then(response => response.json())
    .then(data => {
        for (let i in data) {
            const data_cell = data[parseInt(i)]
            let cell = document.getElementById(`cell${data_cell.pos}`)
            if (cell) {
                const rounds_remained = data_cell.pawn_rounds_remained
                 if(rounds_remained) cell.children[1].children[2].children[0].innerText = rounds_remained
                if (rounds_remained===1) {
                    cell.title = ''
                    cell.style.background = 'white'
                    cell.children[1].removeChild(cell.children[1].children[2])
                    cell.children[1].children[1].children[0].innerText = data_cell.buy_cost
                    if (player_number===current_player) chatSocket.send(JSON.stringify({
                    'type':'chat_message',
                    'message':`закончился срок залога ${data_cell.name}`}));
                }
            }
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}


function check_monopoly() {
    monopoly = []
    for (let i in monopolies) {
        if (monopolies[i].every(element => companies.includes(element))) {
            monopoly.push(i)
        }
    }
    return monopoly!==[]
}

const url_host = window.location.host;
let chatSocket = new WebSocket(`ws://${window.location.host}/ws${window.location.pathname}`);
// const chatSocket = new WebSocket(`ws://127.0.0.1:8000/ws${window.location.pathname}`);


// document.getElementById('send-button').onclick = function() {
//
//     const messageInputDom = document.getElementById('message-input');
//     const message = messageInputDom.value;
//     chatSocket.send(JSON.stringify({
//         'type':'chat_message',
//         'message':message}));
//     messageInputDom.value = '';
// };

// const presenceEl = document.getElementById('pre_cnt');
const messageOutput = document.getElementById('message-output');


document.querySelector('.chat').scrollTop = document.querySelector('.chat').scrollHeight;

chatSocket.onopen = function(event) {
    // setDarkScreen();



    fetch(`../../api/players/?ordering=color&room__name=${room_name}`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }})
    .then(response => response.json())
    .then(data => {
        for (let i in data) {
            let player = data[i]
            if (player.image) document.querySelectorAll('.avatar')[i].src = player.image
            if (!player.lose){
                in_prison = player.in_prison
                if (in_prison) document.querySelector('.prison-buy').style.display = 'block';
                count_roll_in_prison = player.count_roll_in_prison;
                players_positions[player.color]=player.pos
                if (username===player.username) {
                    build_allow = player.build_allowed
                    player_number = player.color
                }
                let chip = document.getElementById(`chip${player.color+1}`)
                let elementToMoveRect = chip.getBoundingClientRect();
                const computedStyles = window.getComputedStyle(chip);
                const transformValue = computedStyles.getPropertyValue('transform');
                const matrix = new DOMMatrix(transformValue);
                const translateX = matrix.m41;
                const translateY = matrix.m42;
                let startX = elementToMoveRect.left -translateX + (elementToMoveRect.width / 2);
                let startY =elementToMoveRect.top - translateY  + (elementToMoveRect.height / 2);
                let targetRect = document.getElementById(`cell${absdiv(player.pos-1, 40)}`).getBoundingClientRect();
                let targetCenterX = targetRect.left + (targetRect.width / 2);
                let targetCenterY = targetRect.top + (targetRect.height / 2);

                let deltaX = targetCenterX - startX;
                let deltaY = targetCenterY - startY;
                // chip.style.transition = 'transform 2s ease-in-out;';
                chip.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            }
            else {
                document.querySelector('.menu').style.display = 'none'
                players = players.filter(element => element !== player.color)
                players_count--
                let chip = document.getElementById(`chip${player.color+1}`)
                document.getElementById(`player${player.color}`).style.background = 'black';
                chip.style.display = 'none'

            }
        }
    }).catch(error => {
        console.error('Error:', error);
    });

     fetch(`../../api/cells/?room__name=${room_name}`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }})
    .then(response => response.json())
    .then(data => {
        for (let i in data) {
            const data_cell = data[parseInt(i)]
             let cell = document.getElementById(`cell${data_cell.pos}`)
            cell_names.push(data_cell.title)
            if (!cell.classList.contains("special-cell")) {
                cell.children[1].children[0].children[0].style.backgroundColor = cell.children[1].children[1].classList[cell.children[1].children[1].classList.length - 1]
                cell.children[1].children[0].children[0].children[0].innerText = data_cell.title
                cell.children[1].children[0].children[0].children[1].innerText = data_cell.category

                cell.children[1].children[0].children[2].children[0].children[1].children[0].children[1].innerText = data_cell.buy_cost/10
                cell.children[1].children[0].children[2].children[0].children[1].children[1].children[1].innerText = data_cell.buy_cost/10*3
                cell.children[1].children[0].children[2].children[0].children[1].children[2].children[1].innerText = data_cell.buy_cost/10*10
                cell.children[1].children[0].children[2].children[0].children[1].children[3].children[1].innerText = data_cell.buy_cost/10*25
                cell.children[1].children[0].children[2].children[0].children[1].children[4].children[1].innerText = data_cell.buy_cost/10*45
                cell.children[1].children[0].children[2].children[0].children[1].children[5].children[1].innerText = data_cell.buy_cost/10*65

                cell.children[1].children[0].children[2].children[0].children[2].children[0].children[1].innerText = data_cell.buy_cost
                cell.children[1].children[0].children[2].children[0].children[2].children[1].children[1].innerText = data_cell.buy_cost/2
                cell.children[1].children[0].children[2].children[0].children[2].children[2].children[1].innerText = data_cell.buy_cost/5*3
                cell.children[1].children[0].children[2].children[0].children[2].children[3].children[1].innerText = Math.round(250 * data_cell.pos/3 / 100) * 100;

                cell.children[0].innerText = data[i].name
                cell.style.background = colors[data_cell.color]
                cell.title = data_cell.color !== 10 ? data_cell.color : ""
                cell.children[1].children[1].children[0].innerText = data_cell.current_cost
                if (data_cell.stars) {
                    cell.children[1].children[2].setAttribute("data-stars", `${data_cell.stars}` )
                    cell.children[1].children[2].children[data_cell.stars-1].style.display = 'block'
                }
                 if (data_cell.pawn_rounds_remaining) {
                        cell.children[1].setAttribute("data-pawn", `1` )
                        cell.style.background =  'rgba(0, 0, 0, 0.75)'
                        const round_wrapper = document.createElement('div')
                         const round_number = document.createElement('span')
                         round_wrapper.classList.add('oval')
                         round_number.classList.add('number')
                         round_number.innerText = data_cell.pawn_rounds_remaining;
                        const id = parseInt(i)
                         if (id>9 && id<20) round_wrapper.style.transform =  'translate(0%, 60%) rotate(270deg)'
                         if (id>19 && id<30) round_wrapper.style.transform =  'translate(20%, 20%) rotate(0deg)'
                         if (id>29 && id<40) round_wrapper.style.transform =  'translate(180%, 50%) rotate(90deg)'
                         round_wrapper.appendChild(round_number)
                         cell.children[1].appendChild(round_wrapper)

                 }
                if (data_cell.color === player_number) {
                    companies.push(parseInt(i))
                }
            }


        }
    }).catch(error => {
        console.error('Error:', error);
    });


    fetch(`../../api/rooms/${room_name}/`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }})
    .then(response => response.json())
    .then(data => {
        count_deals = data.count_deals
        game_start = data.start_game
        count_doubles = data.count_doubles
        current_player = data.current_player
        setTimeout(check_monopoly, 100)
        if (game_start){
            let choosen_player = document.getElementById(`player${current_player}`)
            choosen_player.style.border = '2px solid white'
            document.querySelector('.menu').style.display = player_number===current_player ? 'block' : 'none'
        }
        else {
            document.querySelector('.menu').style.display =  'none'
        }
    }).catch(error => {
        console.error('Error:', error);
    });
    let visibility = localStorage.getItem("buy_modal_visibility");
    if (visibility === "visibility") {
        document.getElementById('myModal').style.display = 'block';
    } else {
        document.getElementById('myModal').style.display = 'none';
    }
    let visibility2 = localStorage.getItem("pay_modal_visibility");
    if (visibility2 === "visibility") {
        document.getElementById('myModal2').style.display = 'block';
        setTimeout(pay_rent, 1000);
    } else {
        document.getElementById('myModal2').style.display = 'none';
    }
     let visibility3 = localStorage.getItem("random_cell_modal_visibility");
    if (visibility3 === "visibility") {
        document.getElementById('modal-pay').style.display = 'block';
        setTimeout(random_cell, 1000);
    } else {
        document.getElementById('modal-pay').style.display = 'none';
    }
    for (let i=0;i<max_players;i++) players.push(i)
};

function setDarkScreen() {
    // Создаем элемент div, представляющий темный экран
    var darkScreen = document.createElement("div");
    darkScreen.style.position = "fixed";
    darkScreen.style.top = "0";
    darkScreen.style.left = "0";
    darkScreen.style.width = "100%";
    darkScreen.style.height = "100%";
    darkScreen.style.backgroundColor = "black";
    darkScreen.style.opacity = "1"; // Прозрачность темного экрана

    // Добавляем элемент в body
    document.body.appendChild(darkScreen);

    // Устанавливаем таймер для удаления темного экрана через 1 секунду
    setTimeout(function() {
        // Удаляем темный экран
        document.body.removeChild(darkScreen);
    }, 200);
}

chatSocket.onclose = function(event) {

    // console.log(players_positions)
    // let data = {
    //             'pos': players_positions[player_number]
    //         };
    //         fetch(`../../api/players/${username}/`,{
    //                  method: 'PUT',
    //                  headers: {
    //                      'Content-Type': 'application/json',
    //                      'X-CSRFToken': getCookie('csrftoken')
    //                  },
    //                  body: JSON.stringify(data)
    //              })
    //                  .then(response => response.json())
    //                  .then(data => {
    //                      console.log(data);
    //                  })
    //                  .catch(error => {
    //                      console.error('Error:', error);
    //                  });
    // Повторное подключение после задержки
};

chatSocket.onmessage = (event) => {
    // document.querySelector('.menu').style.display = player_number===current_player ? 'block' : 'none'

    users_update()
    let data = JSON.parse(event.data)
    // presenceEl.innerHTML = data.online;
    // players_count = parseInt(data.online);
    if (data.type==='start') start();
    else if (data.type === 'init_data') {
        username = data.username
        player_number = data.color
        player_money = document.getElementById(`player${player_number}`).children[2]
        observer.observe(player_money, config);
    }
    else if (data.type === 'chat_message') {
        if (data.time) {
            hours = data.time[0]
            minutes = data.time[1]
            seconds = data.time[2]
        }
        if (data.next_player) {
            document.getElementById(`player${current_player}`).style.border = 'none'
            update_current_player()
            choosen_player = document.getElementById(`player${current_player}`)
            choosen_player.style.border = '2px solid white'
            // if (!count_doubles) next_player();
            document.querySelector('.menu').style.display = player_number===current_player ? 'block' : 'none'
        }
        const span  = document. createElement('span')
        span.innerText = `${data.user} `
        if (data.user_color) span.style.color = colors[data.user_color-1]
        else span.style.color = colors[absdiv(current_player-1, players_count)]
        messageOutput.appendChild(span)
        messageOutput.innerHTML += '<span>' + data.message + '</span>' +'<br>';
    }

    else if (data.type=== 'bankrupt') {
        document.querySelector('.menu').style.display = 'none'
        document.getElementById(`player${current_player}`).style.background = 'black';
        players = players.filter(element => element !== data.player)
        players_count--
        companies.forEach(function (pos){
        const cell = document.getElementById(`cell${pos}`)
        cell.style.background = 'white'
        cell.title = ''
        get_cell(pos).then(data => {
             cell.children[1].children[1].children[0].innerText = data.buy_cost
        })

    })
        if (players_count===1) {
            const modal = document.getElementById('winModel')

            modal.style.display = 'block'
            document.querySelector(".win-model-description").innerText += " " + data.users[players[0]]

        }
    }

    else if (data.type=== 'move_player') {
        if (data.dices[0]===data.dices[1]) {
        }
        move_player(data.dices)
    }

    else if (data.type=== 'buy_company') {
        view_for_buy_company(data.cell_pos, data.target)
    }
    else if (data.type==='prison') {
        prison()
    }
    else if (data.type==='monopoly_view') {
        view_for_monopoly(data.cells)
    }
    else if (data.type==='build') {
        let cell = document.getElementById(`cell${data.cell}`)
        if (data.stars > 1) {
            cell.children[1].children[2].children[data.stars-2].style.display = 'none'
        }
        cell.children[1].children[2].children[data.stars-1].style.display = 'block'
        update_cell(data.cell)
    }
    else if (data.type==='sell') {
        let cell = document.getElementById(`cell${data.cell}`)
        if (data.stars > 1) {
            cell.children[1].children[2].children[data.stars-1].style.display = 'block'
        }
        cell.children[1].children[2].children[data.stars].style.display = 'none'
        update_cell(data.cell)

    }
     else if (data.type==='pawn') {
         const cell = document.getElementById(`cell${data.company}`);
         cell.style.background =  'rgba(0, 0, 0, 0.75)'
            const round_wrapper = document.createElement('div')
             const round_number = document.createElement('span')
             round_wrapper.classList.add('oval')
             round_number.classList.add('number')
             round_number.innerText = '15';
            const id = data.company
             if (id>9 && id<20) round_wrapper.style.transform =  'translate(0%, 60%) rotate(270deg)'
             if (id>19 && id<30) round_wrapper.style.transform =  'translate(20%, 20%) rotate(0deg)'
             if (id>29 && id<40) round_wrapper.style.transform =  'translate(180%, 50%) rotate(90deg)'
             round_wrapper.appendChild(round_number)
             cell.children[1].appendChild(round_wrapper)
            cell.children[1].children[1].children[0].innerText = 0;
             // users_update()
    }
     else if (data.type==='unpawn') {
         const cell = document.getElementById(`cell${data.cell}`);
         cell.style.background =  colors[current_player]
         cell.children[1].children[3].remove()
        update_cell(data.cell)
    }
     else if (data.type==='display_window') {
       document.querySelector('.menu').style.display = 'block'
    }
     else if (data.type==='auction') {
        document.querySelector('.auction-price').innerText = Number(data.price)+100
        const modal = document.getElementById('auction')
         const btn_cancel = document.querySelector('.auction-cancel')
         const btn_success =  document.querySelector('.auction-succes')
        modal.style.display = 'block'
        auction_players = data.auction_players
        function cancel() {
            modal.style.display = 'none'
             auction_players = auction_players.filter(element => element !== player_number)
             if (auction_players.length===1 && data.auction_players_count>=players_count-1) {
                 chatSocket.send(JSON.stringify({
                    'type':'chat_message',
                    'message':`В аукционе победил ${auction_players[0]}`,
                    'next_player':count_doubles===0,}));
                 auction_buy(data.price, auction_players[0], data.cell)
             }
             else if (auction_players.length===0) {
                 chatSocket.send(JSON.stringify({
                    'type':'chat_message',
                    'message':`Все отказались участвовать в аукционе`,
                    'next_player':count_doubles===0,}));
             }
             else {
                 chatSocket.send(JSON.stringify({
                'type': 'auction',
                'target': auction_players[(auction_players.indexOf(data.target)+1)%auction_players.length],
                'auction_players': auction_players,
                 'auction_players_count': data.auction_players_count+1,
                'cell':data.cell,
                'price': data.price
    }));
             }
             this.removeEventListener('click', cancel)
            btn_success.removeEventListener('click', up)
        }
        btn_cancel.addEventListener('click', cancel)
        function up() {
             modal.style.display = 'none'
            if (auction_players.length===1 && data.auction_players_count>=players_count-1) {
                auction_buy(data.price, auction_players[0], data.cell)
                chatSocket.send(JSON.stringify({
                    'type':'chat_message',
                    'message':`В аукционе победил ${auction_players[0]}`,
                    'next_player': count_doubles===0,}));
                return
            }
             chatSocket.send(JSON.stringify({
                'type': 'auction',
                'target': auction_players[(auction_players.indexOf(data.target)+1)%auction_players.length],
                'auction_players': auction_players,
                 'auction_players_count': data.auction_players_count+1,
                'cell':data.cell,
                'price': data.price+100
    }));
            this.removeEventListener('click', up);
              btn_cancel.removeEventListener('click', cancel)
        }
        btn_success.addEventListener('click', up)
    }
     else if (data.type==='deal_suggest') {
        const deal_data = data
        const user_cells = document.querySelectorAll('.deal-company')[2]
        user_cells.innerHTML = ''
        const enemy_cells = document.querySelectorAll('.deal-company')[3]
        enemy_cells.innerHTML = ''
        const modal = document.getElementById('deal-suggest')
        const close_btn = document.querySelector('.deal-close-suggest')
        modal.style.display = 'block'
        document.querySelectorAll('.deal-suggest-money')[0].innerText = deal_data.my_money
        document.querySelectorAll('.deal-suggest-money')[1].innerText = deal_data.enemy_money
        document.querySelectorAll('.deal-money-left')[1].innerText = deal_data.all_my_money
        document.querySelectorAll('.deal-money-right')[1].innerText = deal_data.all_enemy_money
        deal_data.my_companies.forEach(id => {
            add_company_to_modal_deal(id, user_cells)
        })
        deal_data.enemy_companies.forEach(id => {
            add_company_to_modal_deal(id.slice(4), enemy_cells)
        })

        const deal_btn = document.querySelector('.deal-accept')
        function deal_accept() {
            modal.style.display = 'none'
             let Data = {
                room_name: room_name,
                player_money:deal_data.my_money,
                enemy_money:deal_data.enemy_money,
                 player_cells:deal_data.my_companies,
                 enemy_cells:deal_data.enemy_companies,
                 enemy:deal_data.enemy,
                 player: deal_data.player
                };
            fetch('../../game/deal/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(Data)
            })
                .then(response => response.json())
                .then(dat => {
                     chatSocket.send(JSON.stringify({
                    'type':'deal_accept',
                        'player':data.player,
                    'my_companies':data.my_companies,
                    'enemy_companies':data.enemy_companies,
                    'enemy': data.enemy}));
                    chatSocket.send(JSON.stringify({
            'type':'chat_message',
            'message': `согласился на сделку игрока ${document.getElementById(`player${data.player}`).children[1].innerText}`}));
                    console.log(dat);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            this.removeEventListener('click', deal_accept)
        }
        deal_btn.addEventListener('click', deal_accept)
        console.log(close_btn)
        close_btn.addEventListener('click', function () {
            modal.style.display = 'none';
            chatSocket.send(JSON.stringify({
            'type':'chat_message',
            'message': `Отказался от сделки игрока ${document.getElementById(`player${data.player}`).children[1].innerText}`}));
        })
    }
     else if (data.type==='deal_accept') {

         data.my_companies.forEach(id => {
                let cell = document.getElementById(`cell${id}`)
                cell.style.background = colors[data.enemy]
                cell.title = data.enemy
                if (player_number===parseInt(data.enemy)) {
                    companies.push(parseInt(id))
                }
                if (player_number===parseInt(data.player)) {
                    companies = companies.filter(item => item !== parseInt(id))
                }
            })
        data.enemy_companies.forEach(id => {
                let cell = document.getElementById(id)
                cell.style.background = colors[data.player]
                cell.title = data.player
                if (player_number===parseInt(data.player)) {
                    companies.push(parseInt(id.slice(4)))
                }
                if (player_number===parseInt(data.enemy)) {
                    companies = companies.filter(item => item !== parseInt(id.slice(4)))
                }
            })
        if (check_monopoly()) {
            chatSocket.send(JSON.stringify({
                    'type':'monopoly_view',
                    'cells': monopoly,
                    }));
            }
        // users_update()
    }


function add_company_to_modal_deal(cell_id, block) {
    const div = document.createElement("div")
    const container = document.createElement("div")
    // const name = document.createElement("div")
    const price = document.createElement("div")
    const container_small = document.createElement("div")
    container_small.style.display = 'flex'
    div.style.backgroundImage = document.getElementById(`cell${cell_id}`).children[1].style.backgroundImage.replace(' rotated', '')
    div.style.height  ='45px'
    div.style.width  ='200px'
    div.style.backgroundSize = 'contain'
    div.style.backgroundRepeat = 'no-repeat'
    get_cell(parseInt(cell_id)).then(data=> {
         name.innerText = data.name
        price.innerText = data.buy_cost
        // container.appendChild(name)
        container.appendChild(price)
        container_small.appendChild(div)
        container_small.appendChild(container)
        block.appendChild(container_small)})
}

};
function view_for_monopoly(cells){
    for (let i of cells) {
        for (let j of monopolies[i])
            update_cell(j)
    }
}

function view_for_buy_company(cell_pos, target) {
    let cell = document.getElementById(`cell${cell_pos}`)
    if (target) {
        if (player_number===parseInt(target)) {
                    companies.push(parseInt(id.slice(4)))
                }
        cell.style.background = colors[target];
        cell.title = `${target}`
    }
    else {
        cell.style.background = colors[current_player];
        cell.title = `${current_player}`
    }
    update_cell(cell_pos)
    // users_update()
}

function auction_buy(price, player, cell) {
    let data = {
        cell: cell,
        room_name: room_name,
        price: price,
        player: player,
    };

    fetch(`../../game/buy_company/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(dat => {
        chatSocket.send(JSON.stringify({
            'type':'buy_company',
            'cell_pos': cell,
            'target': player}));
        console.log(dat);
        if (check_monopoly()) {
            chatSocket.send(JSON.stringify({
            'type':'monopoly_view',
            'cells': monopoly,
            }));
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


function prison() {
    const chip = document.getElementById(`chip${current_player + 1}`);
    let elementToMoveRect = chip.getBoundingClientRect();
    const computedStyles = window.getComputedStyle(chip);
    const transformValue = computedStyles.getPropertyValue('transform');
    const matrix = new DOMMatrix(transformValue);
    const translateX = matrix.m41;
    const translateY = matrix.m42;
    let startX = elementToMoveRect.left -translateX + (elementToMoveRect.width / 2);
    let startY =elementToMoveRect.top - translateY  + (elementToMoveRect.height / 2);
    let targetRect = document.getElementById(`cell${10}`).getBoundingClientRect();
    let targetCenterX = targetRect.left + (targetRect.width / 2);
    let targetCenterY = targetRect.top + (targetRect.height / 2);

    let deltaX = targetCenterX - startX;
    let deltaY = targetCenterY - startY;

    chip.style.transition = 'transform 1s ease-in-out';
    chip.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    players_positions[current_player] = 11;
    let data = {
                'pos': 11,
                'in_prison':true
            };
            fetch(`../../api/players/${username}/`,{
                     method: 'PUT',
                     headers: {
                         'Content-Type': 'application/json',
                         'X-CSRFToken': getCookie('csrftoken')
                     },
                     body: JSON.stringify(data)
                 })
                     .then(response => response.json())
                     .then(data => {
                         console.log(data);
                     })
                     .catch(error => {
                         console.error('Error:', error);
                     });
}

document.querySelector('.prison-buy').onclick = function () {
    let data = {
                'active': parseInt(document.getElementById(`player${current_player}`).children[2].innerText)-1000,
                'in_prison': false
            };
            let message =   'выкупил себя'
            chatSocket.send(JSON.stringify({
            'type':'chat_message',
            'message':message}));
            fetch(`../../api/players/${username}/`,{
                     method: 'PUT',
                     headers: {
                         'Content-Type': 'application/json',
                         'X-CSRFToken': getCookie('csrftoken')
                     },
                     body: JSON.stringify(data)
                 })
                     .then(response => response.json())
                     .then(data => {
                         // users_update()
                         console.log(data);
                         in_prison = false;
                         let buy = document.querySelector('.prison-buy');
                         buy.style.display = 'none';

                     })
                     .catch(error => {
                         console.error('Error:', error);
                     });
}

function openModalBuild() {
    const modal = document.getElementById("myModal2");
    modal.style.display = "block";
    let cells =[];
    for (let i in monopoly) {
        cells.push(monopolies[monopoly[i]]);
    }
    cells = [].concat(...cells);
    cells.forEach(id => {
        let company = document.getElementById(`cell${id}`)

         company.onclick = function () {
            let data = {
                    room_name: room_name,
                    cell: id
                     };
                fetch('../../game/build/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(data)
                })
                    .then(response => response.json())
                    .then(data => {
                        // users_update()
                        update_cell(company.id.slice(4))
                        console.log(data);
                        modal.style.display = "none";
                        company.onclick = null
                        chatSocket.send(JSON.stringify({
                            'type':'build',
                            'cell':company.id.slice(4)}));
                        chatSocket.send(JSON.stringify({
                            'type':'chat_message',
                            'message':'Построил'}));
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
         }
    })
    window.onclick = function(event) {
    var modal = document.getElementById("myModal2");
    if (event.target === modal) {
        modal.style.display = "none";
         cells.forEach(id => {
        let company = document.getElementById(`cell${id}`)
        company.onclick = NaN;

    })
    }
}
}

function openModalSell() {
    var modal = document.getElementById("myModal2");
    modal.style.display = "block";
    let cells =[];
    for (let i in monopoly) {
        cells.push(monopolies[monopoly[i]]);
    }
    cells = [].concat(...cells);
    cells.forEach(id => {
        let company = document.getElementById(`cell${id}`)
        company.style.zIndex = '2';

         company.onclick = function () {
             company.children[1].children[2].remove();
             update_cell(company.id.slice(4))
            let data = {
                    room_name: room_name,
                    cell: id
                     };
                fetch('../../game/sell/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(data)
                })
                    .then(response => response.json())
                    .then(data => {
                        // users_update()
                        console.log(data);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
         }
    })

}

function openModal() {
    var modal = document.getElementById("myModal2");
    modal.style.display = "block";
    companies.forEach(id => {
        let company = document.getElementById(`cell${id}`)
        company.style.zIndex = '2';
         company.onclick = function () {

             if (!(pawns.includes(company))) {
                 pawns.push(company)
                 let data = {
                     room_name: room_name,
                     cell: id
                 };
                 chatSocket.send(JSON.stringify({
                    'type':'pawn',
                    'company':company.id}));
                chatSocket.send(JSON.stringify({
                    'type':'chat_message',
                    'message':`заложил ${company.id}`}));
                 fetch('../../game/pawn/', {
                     method: 'POST',
                     headers: {
                         'Content-Type': 'application/json',
                         'X-CSRFToken': getCookie('csrftoken')
                     },
                     body: JSON.stringify(data)
                 })
                     .then(response => response.json())
                     .then(data => {
                         console.log(data);
                     })
                     .catch(error => {
                         console.error('Error:', error);
                     });
             }
         }
    })
    window.onclick = function(event) {
    var modal = document.getElementById("myModal2");
    if (event.target === modal) {
        modal.style.display = "none";
         companies.forEach(id => {
        let company = document.getElementById(`cell${id}`)
        company.style.zIndex = '0';
        company.onclick = NaN;

    })
    }
}

}

function openModalBankrupt() {
    let data = {
                    room_name: room_name,
                     };
                fetch('../../game/bankrupt/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify(data)
                })
                    .then(response => response.json())
                    .then(data => {
                        // users_update()
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
     chatSocket.send(JSON.stringify({
            'type': 'bankrupt',
            'player': current_player,
        }));
     chatSocket.send(JSON.stringify({
            'type': 'chat_message',
            'message': `стал банкротом`,
                 'next_player':true,
        }));
}

// function openModalUnPawn() {
//     var modal = document.getElementById("myModal2");
//     modal.style.display = "block";
//     companies.forEach(id => {
//         let company = document.getElementById(`cell${id}`)
//         company.style.zIndex = '2';
//          company.onclick = function () {
//
//
//             if ((pawns.includes(company))){
//                 console.log(company)
//                 pawns = pawns.filter(element => element !== company);
//                 company.style.background = 'rgba(0, 0, 0, 0)'
//                 update_cell(company.id.slice(4))
//              let data = {
//                     room_name: room_name,
//                     cell: id
//                      };
//                 fetch('../../game/unpawn/', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'X-CSRFToken': getCookie('csrftoken')
//                     },
//                     body: JSON.stringify(data)
//                 })
//                     .then(response => response.json())
//                     .then(data => {
//                         // users_update()
//                     })
//                     .catch(error => {
//                         console.error('Error:', error);
//                     });
//             }
//         }
//     })
// }
function openModalDeal() {
    const open_modal = document.getElementById("myModal2");
    open_modal.style.display  = 'block'
    const modal = document.getElementById("deal");
    const close = document.querySelector('.deal-close');
    const inputText1 = document.getElementById('deal-input1');
    const inputText2 = document.getElementById('deal-input2');
    inputText1.value = "";
    inputText2.value = "";
    const button = document.querySelector('.deal-btn');
    const my_companies = document.querySelector('.deal-company');
    const left_money = document.querySelector('.deal-money-left')
    left_money.textContent = '0';
    const right_money = document.querySelector('.deal-money-right')
    right_money.textContent = '0'
    my_companies.innerHTML = ''
    const no_my_companies = document.querySelectorAll('.deal-company')[1];
    no_my_companies.innerHTML = ''
    const enemy_name = document.querySelector('.deal-enemy');
    let left_sum = 0;
    let right_sum = 0;
    let choosen_company1 = [];
    let choosen_company2 = [];
    let enemy_company = []

    inputText1.addEventListener('input', displayText1);
    inputText2.addEventListener('input', displayText2);

    let players = document.querySelectorAll('.player');

    players.forEach(user => {
        if (parseInt(user.id.slice(6))!==player_number) {
            user.style.border = '3px solid black'
            user.addEventListener('click', userClick);
        }
    });

    close.addEventListener('click', closeModal);
    function click_btn() {
        count_deals++;
         modal.style.display = 'none';
        removeEventListeners();

        const content = my_companies.textContent;
        const content2 = no_my_companies.textContent;
        const dataEnemyCells = Array.from(choosen_company2).map(company => company.id);
        const dataUserCells = Array.from(choosen_company1).map(company => company.id.slice(4));
        chatSocket.send(JSON.stringify({
            'type': 'deal_suggest',
            'player': current_player,
            'enemy': enemy_color,
            'my_money': inputText1.value,
            'enemy_money': inputText2.value,
            'all_my_money':left_money.textContent,
            'all_enemy_money':right_money.textContent,
            'my_companies':dataUserCells,
            'enemy_companies':dataEnemyCells,
        }));
        chatSocket.send(JSON.stringify({
            'type': 'chat_message',
            'message': `Предложил сделку игроку ${document.getElementById(`player${enemy_color}`).children[1].innerText}`,
        }));
        this.removeEventListener('click', click_btn)
    }
    button.addEventListener('click', click_btn);



    function displayText1() {
        let player_active = parseInt(player_money.innerText)
        this.value = this.value.replace(/[^0-9]/g, '');
        if (parseInt(this.value) > player_active) {
            this.value = this.value.slice(0, -1);
        }
        left_money.textContent = (left_sum + parseInt(this.value)) ? (left_sum + parseInt(this.value)) : left_sum;
    }
    function displayText2() {
        let player_active = parseInt(document.getElementById(`player${enemy_color}`).children[2].innerText)
        this.value = this.value.replace(/[^0-9]/g, '');
        if (parseInt(this.value) > player_active) {
            this.value = this.value.slice(0, -1);
        }
        right_money.textContent = (right_sum + parseInt(this.value)) ?(right_sum + parseInt(this.value)) : right_sum ;
    }

    function userClick() {
            enemy_color = this.id.slice(6)
             enemy_companies = document.querySelectorAll('.div1')
            enemy_companies.forEach(company => {
                if (company.title===enemy_color) enemy_company.push(company)
            })
            enemy_name.innerText = this.children[1].innerText
            open_modal.style.display = 'none'
            modal.style.display = "block";
             event()
            this.style.border = 'none'
            this.removeEventListener('click', userClick)
        }

    function closeModal() {
        modal.style.display = 'none';
        removeEventListeners();
    }

    function removeEventListeners() {
        button.removeEventListener('click', click_btn);
        companies.forEach(id => {
            let company = document.getElementById(`cell${id}`);
            company.removeEventListener('click', dealUser);
        });

        enemy_company.forEach(company => {
            company.removeEventListener('click', dealEnemy);
        });


    }

    function dealUser(){
            if (!choosen_company1.includes(this)) {

                const div = document.createElement("div")
                const container = document.createElement("div")
                // const name = document.createElement("div")
                const price = document.createElement("div")
                const container_small = document.createElement("div")
                container_small.style.display = 'flex'
                div.style.backgroundImage = this.children[1].style.backgroundImage.replace(' rotated', '')
                div.style.height  ='45px'
                div.style.width  ='200px'
                div.style.backgroundSize = 'contain'
                div.style.backgroundRepeat = 'no-repeat'
                get_cell(parseInt(this.id.slice(4))).then(data=> {
                     name.innerText = data.name
                    price.innerText = data.buy_cost
                    if (data.pos>20 && data.pos<30) {
                        div.style.backgroundImage = this.children[1].style.backgroundImage.replace('.png', ' rotated.png')
                    }
                    // container.appendChild(name)
                    container.appendChild(price)
                    container_small.appendChild(div)
                    container_small.appendChild(container)
                    my_companies.appendChild(container_small)
                    left_sum = parseInt(left_sum) + data.buy_cost;
                    left_money.textContent = parseInt(left_money.textContent) + (parseInt(inputText1.textContent) || 0) + data.buy_cost;
                    choosen_company1.push(this)
                })

            }
            else {
                get_cell(parseInt(this.id.slice(4))).then(data=> {
                    my_companies.children[choosen_company1.indexOf(this)].remove()
                    choosen_company1 = choosen_company1.filter(element => element !== this);
                    left_sum = parseInt(left_sum) - data.buy_cost;
                    left_money.textContent = parseInt(left_money.textContent)  - data.buy_cost;
                })
            }

        }

    function dealEnemy(){
            const div = document.createElement("div")
                const container = document.createElement("div")
                // const name = document.createElement("div")
                const price = document.createElement("div")
                const container_small = document.createElement("div")
                container_small.style.display = 'flex'
                div.style.backgroundImage = this.children[1].style.backgroundImage.replace(' rotated', '')

                div.style.height  ='45px'
                div.style.width  ='200px'
                div.style.backgroundSize = 'contain'
                div.style.backgroundRepeat = 'no-repeat'
            get_cell(parseInt(this.id.slice(4))).then(data=> {
                if (!choosen_company2.includes(this)) {
                     name.innerText = data.name
                    price.innerText = data.buy_cost
                    if (data.pos>20 && data.pos<30) {
                        div.style.backgroundImage = this.children[1].style.backgroundImage.replace('.png', ' rotated.png')
                    }
                    // container.appendChild(name)
                    container.appendChild(price)
                    container_small.appendChild(div)
                    container_small.appendChild(container)
                    no_my_companies.appendChild(container_small)
                    right_sum = parseInt(right_sum) + data.buy_cost;
                    // no_my_companies.appendChild(div)
                    right_money.textContent = parseInt(right_money.textContent) + (parseInt(inputText2.textContent) || 0) + data.buy_cost;
                    choosen_company2.push(this)
                }
                else {
                    no_my_companies.children[choosen_company2.indexOf(this)].remove()
                    choosen_company2 = choosen_company2.filter(element => element !== this);
                    right_sum = parseInt(right_sum) - data.buy_cost;
                    right_money.textContent = parseInt(right_money.textContent) - data.buy_cost;
                }
            })
        }
//     function dealCompany(isUser) {
//     const div = document.createElement("div");
//     const container = document.createElement("div");
//     const name = document.createElement("div");
//     const price = document.createElement("div");
//     const container_small = document.createElement("div");
//     container_small.style.display = 'flex';
//     div.style.backgroundImage = this.children[1].style.backgroundImage.replace(' rotated', '');
//     div.style.height = '45px';
//     div.style.width = '200px';
//
//     get_cell(parseInt(this.id.slice(4))).then(data => {
//         name.innerText = data.name;
//         price.innerText = data.buy_cost;
//         container.appendChild(name);
//         container.appendChild(price);
//         container_small.appendChild(div);
//         container_small.appendChild(container);
//
//         const companyList = isUser ? my_companies : no_my_companies;
//         let chosenCompanies = isUser ? choosen_company1 : choosen_company2;
//         const moneyElement = isUser ? left_money : right_money;
//         const inputTextElement = isUser ? inputText1 : inputText2;
//         let sumElement = isUser ? left_sum : right_sum;
//
//         if (!chosenCompanies.includes(this)) {
//             companyList.appendChild(container_small);
//             sumElement += data.buy_cost;
//             moneyElement.textContent = parseInt(moneyElement.textContent) + (parseInt(inputTextElement.textContent) || 0) + data.buy_cost;
//             chosenCompanies.push(this);
//         } else {
//             companyList.children[chosenCompanies.indexOf(this)].remove();
//             chosenCompanies = chosenCompanies.filter(element => element !== this);
//             sumElement -= data.buy_cost;
//             moneyElement.textContent = parseInt(moneyElement.textContent) - data.buy_cost;
//         }
//     });
// }
//
// // Использование функции для пользователя
// function dealUser() {
//     dealCompany.call(this, true);
// }
//
// // Использование функции для врага
// function dealEnemy() {
//     dealCompany.call(this, false);
// }

                function event () {
            companies.forEach(id => {
        let company = document.getElementById(`cell${id}`)
        company.addEventListener('click', dealUser)
    })
    enemy_company.forEach(company => {
        company.addEventListener('click', dealEnemy)
    })
        }
}

document.getElementById('btn-auction').onclick = function () {
    localStorage.setItem("buy_modal_visibility", "hidden");
    document.getElementById('myModal').style.display = 'none';
    document.getElementById('auction').style.display = 'block';
    auction_players = []
    for (let i=0;i<players_count;i++) auction_players.push(i)
     document.getElementById('auction').style.display = 'none';
    chatSocket.send(JSON.stringify({
        'type': 'auction',
        'target': (current_player+1)%players_count,
        'auction_players': auction_players,
        'cell':players_positions[current_player]-1,
        'auction_players_count':0,
        'price': parseInt(document.getElementById(`cell${players_positions[current_player]-1}`).children[1].children[1].children[0].innerText)
    }));

}


function casino() {
    const modal = document.getElementById("casino");
    modal.style.display = 'block'
    const checkboxes = document.querySelectorAll('.casino-checkbox');
    const winMoney = document.querySelector('.casino-win');
    const casinoYesButton = document.querySelector('.casino-yes');
    casinoYesButton.disabled = true;
    let countChecked = 0;
    let checked = [];
    casinoYesButton.disabled = 1000 < parseInt(player_money.innerText);


     function updateWinMoney() {
        let winnings = 0;
        if (countChecked === 1) winnings = 6000;
        else if (countChecked === 2) winnings = 3000;
        else if (countChecked === 3) winnings = 2000;

        // Ensure that winnings cannot be set to 0
        winMoney.innerText = winnings > 0 ? winnings : 0;

        // Enable or disable the "casino-yes" button based on whether at least one die is selected
        casinoYesButton.disabled = countChecked === 0;
    }

    function change() {
        if (this.checked) {
            countChecked++;
            checked.push(this.value);
            if (countChecked > 3) {
                this.checked = false;
                countChecked--;
                checked = checked.filter(element => element !== this.value);
            }
        } else {
            countChecked--;
            checked = checked.filter(element => element !== this.value);
        }
        updateWinMoney();
    }

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', change);
    });

    function resetModal() {
        modal.style.display = 'none';
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            checkbox.removeEventListener('change', change);
        });
        winMoney.innerText = 0;
    }

    document.querySelector('.casino-no').onclick = function () {
        resetModal();
        chatSocket.send(JSON.stringify({
            'type': 'chat_message',
            'message': ` отказался играть в казино`,
            'next_player': count_doubles===0
        }));
    };

    document.querySelector('.casino-yes').onclick = function () {
        let winning = -1000;
        const randomDice = getRandomInt(1, 6);
        if (checked.includes(`${randomDice}`)) winning = parseInt(winMoney.innerText);

        const data = {
            'active': parseInt(document.getElementById(`player${current_player}`).children[2].innerText) + winning,
        };

        const message = winning > 0 ? `выиграл ${winning}` : 'проебал 1000';

        chatSocket.send(JSON.stringify({
            'type': 'chat_message',
            'message': message,
            'next_player': count_doubles===0
        }));

        fetch(`../../api/players/${username}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });

        resetModal();
    };
}


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}




document.getElementById('rollButton').addEventListener('click', function() {
    document.querySelector('.menu').style.display = 'none'
    let dices =[getRandomInt(1,6), getRandomInt(1,6)]
    while (players_positions.includes(players_positions[current_player]+dices[1]+dices[0])) {
        dices =[getRandomInt(1,6), getRandomInt(1,6)]
    }
    // const dices =[30, 0]
    // [getRandomInt(1,6), getRandomInt(1,6)]
    if (!in_prison || (in_prison && dices[0]===dices[1]) || count_roll_in_prison===3) {
            if (in_prison && dices[0]===dices[1]) {
                chatSocket.send(JSON.stringify({
                    'type': 'chat_message',
                    'message': ` выбросил дубль  и выходит из тюрьмы`,
                }));

            }
            in_prison=false
            count_roll_in_prison = 0
        }
        else {
            count_roll_in_prison++
            dice_animation(dices[0], dices[1])
        }
        if (!in_prison) {
            chatSocket.send(JSON.stringify({
        'type':'move_player',
        'message':current_player,
                'dices':dices
        }));
            let data = {
                'pos': absdiv(players_positions[player_number]+dices[0]+dices[1], 40),
                'in_prison': in_prison,
                'count_roll_in_prison': count_roll_in_prison,
            };
            fetch(`../../api/players/${username}/`,{
                     method: 'PUT',
                     headers: {
                         'Content-Type': 'application/json',
                         'X-CSRFToken': getCookie('csrftoken')
                     },
                     body: JSON.stringify(data)
                 })
                     .then(response => response.json())
                     .then(data => {
                         console.log(data);
                     })
                     .catch(error => {
                         console.error('Error:', error);
                     });
        }
        else {
             chatSocket.send(JSON.stringify({
                    'type': 'chat_message',
                    'message': `не  выбросил дубль и остался в тюрьме`,
                    'next_player': true
                }));
        }
        if (dices[0]===dices[1] && !in_prison) {
            document.querySelector('.menu').style.display = 'block'
            chatSocket.send(JSON.stringify({
                    'type': 'chat_message',
                    'message': `выбросил  дубль и получил дополнительный ход`,
                }));
            count_doubles++;
            if (count_doubles===3) {
                count_doubles=0
                in_prison=true
                document.querySelector('.prison-buy').style.display = 'block';
                setTimeout(function (){
                    chatSocket.send(JSON.stringify({
                     'type':'prison',
                     'player':current_player}));
                }, 1000)
                setTimeout(function (){
                     chatSocket.send(JSON.stringify({
                    'type': 'chat_message',
                    'message': `выбросил 3 дубля подряд и попал в тюрьму`,
                    'next_player': true
                }));
                }, 1000)
            }
        }
        else {
            count_doubles = 0;
        }
    setTimeout(function (){
       if (!in_prison)  choice()
    }, 1500)
})

function handleKeyPress(event) {
    // Проверяем, была ли нажата клавиша Enter (код 13)
    if (event.keyCode === 13) {
      // Вызываем вашу функцию
      chatMessage();
    }
  }

function chatMessage() {
    const messageInputDom = document.getElementById('message-input');
    const message = messageInputDom.value;
    chatSocket.send(JSON.stringify({
        'type':'chat_message',
        'message':message}));
    messageInputDom.value = '';
}


 const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                let cell_pos = absdiv(players_positions[current_player] - 1, 40)
                try {
                     document.getElementById('buy').disabled = parseInt(document.getElementById(`cell${cell_pos}`).children[1].children[1].children[0].innerText) > parseInt(player_money.innerText)
                     document.querySelector('.pay-btn').disabled = parseInt(document.getElementById(`cell${cell_pos}`).children[1].children[1].children[0].innerText) > parseInt(player_money.innerText)
                }
                catch (TypeError) {
                    console.log('OK')
                }

            });
        });
const config = { childList: true, subtree: true, characterData: true };

function choice() {
     let cell_pos = absdiv(players_positions[current_player] - 1, 40)
     let cell = document.getElementById(`cell${cell_pos}`);
     const buy_btn = document.getElementById('buy')
     if (cell.title && cell.title!==`${current_player}`) {

        pay_rent(cell_pos)
    }
     else if (cell_pos===20) casino();
       else if (cell_pos===30) {
           in_prison = true;
           let buy = document.querySelector('.prison-buy');
            buy.style.display = 'block';
           chatSocket.send(JSON.stringify({
             'type':'prison',
             'player':current_player}));
           chatSocket.send(JSON.stringify({
                    'type': 'chat_message',
                    'message': ` отправился на нары`,
                    'next_player': true
                }));
     }
     else if (cell.title===`${current_player}`) {
           chatSocket.send(JSON.stringify({
            'type': 'chat_message',
            'message': `зашёл к себе`,
               'next_player':count_doubles===0,
        }));
     }
    else if (!cell.classList.contains("special-cell") && cell_pos !== 10) {
        document.getElementById('myModal').style.display = 'block';
        localStorage.setItem("buy_modal_visibility", "visibility");
        buy_btn.onclick = function () {
        companies.push(cell_pos);

            buy_company(cell_pos)

        }}
        else if (cell_pos!==0 && cell_pos !== 10){
            random_cell()
        }
        else {
            chatSocket.send(JSON.stringify({
            'type': 'chat_message',
            'message': `ничего интересного`,
                 'next_player':count_doubles===0,
        }));
     }

    // chatSocket.send(JSON.stringify({
    //      'type':'display_window',
    //      'player':(current_player+1)%players_count}));

}
document.getElementById('buy').onclick = function () {
        companies.push(players_positions[current_player]-1);

            buy_company(players_positions[current_player]-1)

        }
function random_cell() {
            localStorage.setItem("random_cell_modal_visibility", 'visibility');
            document.getElementById('myModal').style.display = 'none';
            const modal = document.getElementById('modal-pay')
            modal.style.display = 'block'
            const pay_btn = document.querySelector('.pay-btn')
            pay_btn.disabled = 1000 > parseInt(player_money.innerText)
            let prize = [-1000,1000][getRandomInt(0,1)]
    function pay_click() {
                localStorage.setItem("random_cell_modal_visibility", 'hidden');
                modal.style.display = 'none'
     let data = {
                'active': parseInt(document.getElementById(`player${current_player}`).children[2].innerText)+prize,
            };
            let message = prize > 0 ?  'получил 1000' : 'проебал 1000'
            modal.children[0].children[0].innerText = message
            chatSocket.send(JSON.stringify({
            'type':'chat_message',
            'message':message,
            'next_player': count_doubles===0
            }));
            fetch(`../../api/players/${username}/`,{
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(data => {
                    console.log( data);
                }).catch(error => {
                console.error('Error:', error);
            });
    pay_btn.removeEventListener('click', pay_click)
    }
    pay_btn.addEventListener('click', pay_click)
}

function buy_company(cell_pos) {
    document.querySelector('.menu').style.display = player_number===current_player ? 'block' : 'none'

            document.getElementById('myModal').style.display = 'none';
            localStorage.setItem("buy_modal_visibility", "hidden");
            let data = {
                cell: cell_pos,
                room_name: room_name,
            };
            fetch(`../../game/buy_company/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(data => {
                    chatSocket.send(JSON.stringify({
                'type': 'buy_company',
                'cell_pos': cell_pos,
                }));
                    chatSocket.send(JSON.stringify({
                        'type': 'chat_message',
                        'message': `купил компанию ${cell_names[cell_pos]}`,
                        'next_player': count_doubles===0
                    }));
                    if (check_monopoly()) {
            chatSocket.send(JSON.stringify({
                    'type':'monopoly_view',
                    'cells': monopoly,
                    }));
                }

                    console.log(data);

                }).catch(error => {
                console.error('Error:', error);
            });
}


function pay_rent(cell_pos) {
    localStorage.setItem("pay_rent_modal_visibility", 'visibility');
    document.getElementById('myModal').style.display = 'none';
    const modal = document.getElementById('modal-pay')
    modal.style.display = 'block'
    const pay_btn = document.querySelector('.pay-btn')
    const cell = document.getElementById(`cell${cell_pos}`)
    pay_btn.innerText = "Заплатить " + cell.children[1].children[1].children[0].innerText
    pay_btn.disabled = parseInt(cell.children[1].children[1].children[0].innerText) > parseInt(player_money.innerText)

    function pay_click() {
        localStorage.setItem("pay_rent_modal_visibility", 'hidden');
        modal.style.display = 'none'
         let data = {
            'room_name': room_name,
            'cell':cell_pos,
             'enemy': parseInt(cell.title)
    };
    fetch(`../../game/pay_rent/`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        chatSocket.send(JSON.stringify({
        'type':'chat_message',
            'next_player': count_doubles===0,
        'message':`заплатил аренду ${cell.children[1].children[1].children[0].innerText}`}));
    })
    .catch(error => {
        console.error('Error:', error);
    });
    // data = {
    //     'active': parseInt(document.getElementById(`player${current_player}`).children[2].innerText)-
    //          parseInt(cell.children[1].children[1].children[0].innerText)
    // };
    // fetch(`../../api/players/${player_id}/`,{
    //     method: 'PUT',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'X-CSRFToken': getCookie('csrftoken')
    //     },
    //     body: JSON.stringify(data)
    // })
    // .then(response => response.json())
    // .then(data => {
    //     console.log(data);
    //     chatSocket.send(JSON.stringify({
    //     'type':'chat_message',
    //         'next_player': count_doubles===0,
    //     'message':`заплатил аренду`}));
    // })
    // .catch(error => {
    //     console.error('Error:', error);
    // });
    pay_btn.removeEventListener('click', pay_click)
    }
    pay_btn.addEventListener('click', pay_click)
}


async function move_player(dices) {
  const chip = document.getElementById(`chip${current_player + 1}`);
  const dice1 = dices[0];
  const dice2 = dices[1];
  //   const dice1 = 2;
  // const dice2 = 2;
  dice_animation(dice1,dice2)
  let current_pos = players_positions[current_player] % 40;
  let pos = current_pos + dice1 + dice2;
  players_positions[current_player] = pos;


  if (current_pos < 0) current_pos += 40;
  // chip.style.transform = `translate(0px, 0px)`;

  let elementToMoveRect = chip.getBoundingClientRect();
  const computedStyles = window.getComputedStyle(chip);
  const transformValue = computedStyles.getPropertyValue('transform');
  const matrix = new DOMMatrix(transformValue);
  const translateX = matrix.m41;
  const translateY = matrix.m42;
  let startX = elementToMoveRect.left - translateX + elementToMoveRect.width / 2;
  let startY = elementToMoveRect.top - translateY + elementToMoveRect.height / 2;

  for (let i = current_pos; i < pos; i++) {
      if (i===40 && current_player===player_number) money_for_round();
    let targetRect = document.getElementById(`cell${i % 40}`).getBoundingClientRect();
    // Вычисляем центр элемента, к которому будем перемещать
    let targetCenterX = targetRect.left + targetRect.width / 2;
    let targetCenterY = targetRect.top + targetRect.height / 2;

    let deltaX = targetCenterX - startX;
    let deltaY = targetCenterY - startY;

    chip.style.transition = 'transform 0.3s ease-in-out';
    chip.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    // Добавляем задержку между анимациями
    await new Promise(resolve => setTimeout(resolve, 150));
  }

}


function money_for_round() {
    const dataToUpdate = {
    // Your updated data here
    'active': parseInt(document.getElementById(`player${current_player}`).children[2].innerText)+2000,
};
    fetch(`../../api/players/${username}/`,{
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify(dataToUpdate),})
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (current_player===player_number) chatSocket.send(JSON.stringify({
        'type':'chat_message',
        'message':`Прошёл круг и получил 2000`}));
    }).catch(error => {
        console.error('Error:', error);
    });
}


function users_update() {
    fetch(`../../api/players/?ordering=color&room__name=${room_name}`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }})
    .then(response => response.json())
    .then(data => {
        for (let i in data) {
            let player = document.getElementById(`player${i}`)
            player.children[1].innerText = data[i].username
            player.children[2].innerText = data[i].active
            if (data[i].image) player.children[0].children[0].src = data[i].image
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}











function update_cell(id) {
    fetch(`../../api/cells/?name=cell${id}&room__name=${room_name}`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }})
    .then(response => response.json())
    .then(data => {
        let cell = document.getElementById(`cell${data[0].pos}`)
       cell.children[1].children[1].children[0].innerText = data[0].current_cost
    }).catch(error => {
        console.error('Error:', error);
    });
}

let dice = document.querySelectorAll('#dice');

function dice_animation(number1,number2) {
    let dice = document.querySelectorAll('#dice');
    dice[0].dataset.side = number1;
    dice[0].classList.toggle("reRoll");
    dice[1].dataset.side = number2;
    dice[1].classList.toggle("reRoll");

}

function start() {
    game_start = true
    document.querySelector('.menu').style.display = player_number===current_player ? 'block' : 'none'
    document.getElementById(`player${0}`).style.border = '1px solid white'
    // document.getElementById(`player${0}`).style.backgroundColor = colors[0]
    //  fetch(`../../api/cells/?room__name=${room_name}`,{
    //     method: 'GET',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'X-CSRFToken': getCookie('csrftoken')
    //     }})
    // .then(response => response.json())
    // .then(data => {
    //     // for (let i=0;i<players_count;i++) {
    //     //     players.push(i)
    //     // }
    //     for (let i=0;i<40;i++){
    //         let cell = document.getElementById(`cell${i}`)
    //         if (!cell.classList.contains("special-cell")) {
    //             cell.children[0].innerText = data[i].name
    //             // cell.children[1].innerText = data[i].buy_cost
    //             cell.children[1].children[1].children[0].innerText = data[i].current_cost
    //             // cell.children[1].children[0].children[0].innerText = data[i].buy_cost / 2 + '$'
    //         }
    //     }
    // }).catch(error => {
    //     console.error('Error:', error);
    // });
}

// document.addEventListener("DOMContentLoaded", function() {
//     // Вызываем функцию установки темного экрана
//     setDarkScreen();
//
//     // Добавьте ваш остальной код JavaScript здесь
// });