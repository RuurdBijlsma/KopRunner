class AStarNode{
	constructor()
	{
		//unieke id per instance generaten
		this.id = AStarNode.generateID++;
	}

	static set generateID(n)
	{
		AStarNode._id = n;
	}

	static get generateID()
	{
		if(!AStarNode._id)
			AStarNode._id = 0;
		return AStarNode._id;
	}
}