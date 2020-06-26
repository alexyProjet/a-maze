class Player {
    constructor(startingScore_, gamerTag_, isTrapper_ = false) {
        this.score = startingScore_
        this.name = gamerTag_
        this.mapVisible
        this.playerVisible
        this.canMove
        this.canClick

        if (isTrapper_) {
            this.mapVisible = true;
            this.playerVisible = false;
            this.canMove = false;
            this.canClick = true;
        } else {
            this.mapVisible = false;
            this.playerVisible = true;
            this.canMove = true;
            this.canClick = false;
        }

    }

    makeTrapper() {
        this.mapVisible = true;
        this.playerVisible = false;
        this.canMove = false;
        this.canClick = true;
    }

    makeExplorer() {
        this.mapVisible = false;
        this.playerVisible = true;
        this.canMove = true;
        this.canClick = false;
    }
}