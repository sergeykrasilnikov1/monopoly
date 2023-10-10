//     let url = window.location.href.substring(7, 22) + 'ws/game/' +window.location.href.substring(22)const showPopupButtons = document.querySelectorAll('.show-popup');

const user = document.getElementById("user").innerText
let color=0
let players_count
let pos = 0
let monopoly = []

const colors = ['red', 'green', 'yellow', 'blue']

function rollDice(usr) {
     fetch(`http://localhost:8000/api/players/${usr}/`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }})
    .then(response => response.json())
    .then(data => {
        dice1.textContent = data.dice1;
        dice2.textContent = data.dice2;
        dice1.classList.add('roll-animation');
        dice2.classList.add('roll-animation');
        setTimeout(() => {
        dice1.classList.remove('roll-animation');
        dice2.classList.remove('roll-animation');
    }, 1000);
        // Process the data here
        let player = data.color
        color = player
        pos = data.pos%40
        let dice = data.dice1 + data.dice2;
        let chip = document.getElementById(`chip${player+1}`)

        let current_pos = (pos -dice)%40
        if (current_pos<0) current_pos+=40;
        chip.style.transform = `translate(0px, 0px)`;
         let elementToMoveRect = chip.getBoundingClientRect();
         const computedStyles = window.getComputedStyle(chip);

// Получаем значение transform
    const transformValue = computedStyles.getPropertyValue('transform');
         const matrix = new DOMMatrix(transformValue);
        const translateX = matrix.m41;
        const translateY = matrix.m42;
        let startX;
        let startY;
         startX =elementToMoveRect.left -translateX + (elementToMoveRect.width / 2);
         startY =elementToMoveRect.top - translateY  + (elementToMoveRect.height / 2);
        // Получение координат центра element1
       move(current_pos)
        // chatSocket.send('1 123')
        function move(i){
           if (i===39) {
               fetch('../../game/round/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        // body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        // chatSocket.send('3 ' + data.message)
        console.log(data); // Process the response from the server.
        users_update()
    })
    .catch(error => {
        console.error('Error:', error);
    });
           }
            i = i%40
            let targetRect = document.getElementById(`cell${i}`).getBoundingClientRect();

    // Вычисляем центр элемента, к которому будем перемещать
            let targetCenterX = targetRect.left + (targetRect.width / 2);
            let targetCenterY = targetRect.top + (targetRect.height / 2);

            let deltaX = targetCenterX - startX;
            let deltaY = targetCenterY - startY;

            chip.style.transition = 'transform 0.1s ease-in-out';
            chip.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
 }
 function listener() {
     current_pos+=1;
     current_pos%=40
    if (current_pos!== pos) move(current_pos);
    else chip.removeEventListener('transitionend', listener);
}

chip.addEventListener('transitionend', listener);
    })
    .catch(error => console.error('Error:', error));
}
let dice;
let room_name = window.location.href.split('/')[4]
const dice1 = document.getElementById('dice1');
const dice2 = document.getElementById('dice2');

document.getElementById('rollButton').addEventListener('click', function() {

    let data = {
        dice1: Math.floor(Math.random() * 6) + 1,
        dice2: Math.floor(Math.random() * 6) + 1,
        room_name: room_name,
    };

    fetch('../../game/roll/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        chatSocket.send('3 ' + data.message)
        console.log(data); // Process the response from the server.
    })
    .catch(error => {
        console.error('Error:', error);
    });

});

document.getElementById('rollButton').onclick = function () {
    setTimeout(choise, 1500)
    document.getElementById('skip').onclick = function () {
        document.getElementById('myModal').style.display = 'none';
    }
    console.log(monopoly)
    if (monopoly.length>0) {
            document.getElementById('build').style.display = 'block';
        }
    else document.getElementById('build').style.display = 'none';
    document.getElementById('build').onclick = function () {

        document.getElementById('myModal').style.display = 'none';
        let cells = document.querySelectorAll('.div1')
        const popups = document.querySelectorAll('.popup');
    const showPopupButtons = document.querySelectorAll('.div1');
    const build_button = document.querySelectorAll('.build-permit');
    showPopupButtons.forEach(function(cell, index) {

        function cluc() {
            popups[index].classList.add('active');
            build_button.forEach(button =>{
                button.addEventListener('click', function (){
                    console.log(button)
                    let data = {
                        cell: cell.children[0].innerText
                    }
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
                    chatSocket.send(`6 ${data.message} ${data.cell}`)
                })
                .catch(error => {
                    console.error('Error:', error);
                });
                })
            })
        }
        if (cell.style.color===colors[color]) {
            cell.addEventListener('click', cluc);

            cell.addEventListener('mouseleave', function () {
                cell.removeEventListener('click', cluc);
                popups[index].classList.remove('active');
            });
        }
    });
        // cells.forEach((cell) =>{
        //     if (cell.style.color===colors[color]){
        //         // cell.onclick() =  () => {
        //             console.log(cell)
        //         document.getElementById(cell.children[0].innerText).onclick = function () {
        //                 document.getElementById(cell.children[0].innerText).onclick = null
        //         }
        //         // }
        //     }
        // })
    }
    document.getElementById('buy').onclick = function () {

        let cell = pos-1
        if (cell<0) cell=39;
        chatSocket.send(`5 ${cell}`)
        document.getElementById('myModal').style.display = 'none';
         let data = {
        cell: cell,
        room_name: room_name,
    };

    fetch('../../game/buy/', {
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
        monopoly = []
        for (let i in data.message.split(' ')) monopoly.push(parseInt(data.message.split(' ')[i]))
        console.log(monopoly)
    })
    .catch(error => {
        console.error('Error:', error);
    });
    }
    document.getElementById('rollButton').style.display = 'none'

    chatSocket.send(`4 ${(color+1)%players_count}`)
}


function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
    }



let url = window.location.href.substring(7, 22) + 'ws/' +window.location.href.substring(22)
const chatSocket = new WebSocket(`ws://${url}`);


document.getElementById('send-button').onclick = function() {

    const messageInputDom = document.getElementById('message-input');
    const message = messageInputDom.value;
    chatSocket.send('1 ' + message);
    messageInputDom.value = '';
};

const presenceEl = document.getElementById('pre_cnt');
const messageOutput = document.getElementById('message-output');

chatSocket.onmessage = (event) => {
    users_update()
    let data = JSON.parse(event.data)
    presenceEl.innerHTML = data.online;
    players_count = data.online;
    let message = data.message;

    if (data.roll_display){
        document.getElementById('rollButton').style.display = 'block'

    }
    if (data.cell) {
        let cel = document.getElementById(`cell${data.cell}`)
        cel.style.color = colors[color];
        cel.children[1].innerText = parseInt(cel.children[1].innerText)/10
        users_update()
    }
    if (data.cell_star) {
        console.log(data.cell_star)
        let cel = document.getElementById(`${data.cell_name}`)
        cel.children[1].innerText = parseInt(cel.children[1].innerText)*2
        users_update()
    }
    if (data.roll) {
        rollDice(data.roll)
    }
    else if (message) {
        if (message==='123')document.getElementById('rollButton').style.display = 'none'
        messageOutput.innerHTML += '<p>' + message + '</p>';
    }
    // data.users.forEach(user => {
        // const li2 = document.createElement("div");
        // li2.classList.add("player")
        // user = user.split(' ')
        // li2.innerHTML =
        // onlineUsers.appendChild(li2);
    // });
};


function choise () {
    document.getElementById('myModal').style.display = 'block';
}


document.getElementById('openModal').addEventListener('click', function() {
    document.getElementById('myModal').style.display = 'block';
});

document.getElementsByClassName('close')[0].addEventListener('click', function() {
    document.getElementById('myModal').style.display = 'none';
});

// window.addEventListener('click', function(event) {
//     if (event.target == document.getElementById('myModal')) {
//         document.getElementById('myModal').style.display = 'none';
//     }
// });

function start() {
     fetch(`http://localhost:8000/api/cells/`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }})
    .then(response => response.json())
    .then(data => {
        for (let i=0;i<40;i++){
            let cell = document.getElementById(`cell${i}`)
            cell.children[0].innerText = data[i].name
            cell.children[1].innerText = data[i].buy_cost
            cell.children[2].children[0].children[0].innerText = data[i].buy_cost/2 + '$'

        }
    }).catch(error => {
        console.error('Error:', error);
    });
}

function users_update() {
    fetch(`http://127.0.0.1:8000/api/players/custom_action/${room_name}`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }})
    .then(response => response.json())
    .then(data => {
        let i=0;
        for (let user in data) {
            let player = document.getElementById(`player${i}`)
            player.children[1].innerText = data[i].username
            player.children[2].innerText = data[i].active
            i++;
        }
        // for (let i=0;i<40;i++){
        //     let cell = document.getElementById(`cell${i}`)
        //     cell.children[0].innerText = data[i].name
        //     cell.children[1].innerText = data[i].buy_cost

        // }
    }).catch(error => {
        console.error('Error:', error);
    });
}

start()