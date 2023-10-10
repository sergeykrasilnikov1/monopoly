import random

class Player:
    def __init__(self, color, name='anonim'):
        self.name = name
        self.active = 20000
        self.passive = 20000
        self.color = None
        self.pos = 0
        self.cells = []




class Cell:
    def __init__(self, name, pos):
        self.owner = None
        self.name = name
        self.buildings = 0
        self.group_colors = None
        self.build_cost = []
        self.buy_cost = random.randint(1000,5000)
        self.pos = pos
        self.color = None

    def buy(self, player):
        if player.active >= self.buy_cost:
            player.active -= self.buy_cost
            self.owner = player
            player.cells.append(self)
        else:
            print('Not money')

    def visit(self, player):
        if player == self.owner:
            return
        if player.active >= self.buy_cost:
            player.active -= self.buy_cost
        else:
            print('Not money')


class GameField:

    def __init__(self):
        self.cells = []
        self.chosen_player = 1
        self.players = []

    def add_player(self, name):
        player = Player(len(self.players), name)
        self.players.append(player)


    def add_cell(self,):
    def move(self, player):
            dice1, dice2 = random.randint(1, 6), random.randint(1, 6)
            player.pos +=dice1+dice2

    def game(self):
        while(True):
            print(f"move {self.chosen_player} player")
            action = int(input("1 - move 2 - deal"))
            if action==1:
                self.move(self.players[self.chosen_player])
                if self.cells[self.players[self.chosen_player].pos].owner == None:
                    action = int(input("1 - buy 2 - auction 3 - skip" ))
                    if action==1:
                        self.cells[self.players[self.chosen_player].pos].buy(self.players[self.chosen_player])
                    elif action==2:
                        pass
                    elif action==3:
                        pass
                self.chosen_player+=1
                if (self.chosen_player==4):
                    self.chosen_player = 0
            if action==2:
                pass


class InfoWindow():
    pass


game = GameField()
game.add_player('sergo1')
game.add_player('sergo2')
game.game()
