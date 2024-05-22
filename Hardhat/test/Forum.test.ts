import { expect } from 'chai';
import { Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { makeBig } from '../../Front-end/lib/number-utils';

describe('Forum', () => {
  let goflow: Contract;
  let forum: Contract;
  let owner: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress;

  // We want to post the same question and answers for each test
  // so we create a function to avoid duplicating code
  const postQuestionsAndAnswers = async (user1: SignerWithAddress, user2: SignerWithAddress) => {
    const tx = await forum.connect(user1).postQuestion('are you my fren?');
    await tx.wait();
    const tx2 = await forum.connect(user2).postQuestion('suh?');
    await tx2.wait();

    const tx3 = await forum.connect(user1).postAnswer(0, 'yes, I am');
    await tx3.wait();
    const tx4 = await forum.connect(user2).postAnswer(1, 'dude!');
    await tx4.wait();
  };

  beforeEach(async () => {
    // the getSigners() method allows us a to create mock users
    const [_owner, _user1, _user2] = await ethers.getSigners();
    owner = _owner;
    user1 = _user1;
    user2 = _user2;
  });

  beforeEach(async () => {
    // Deploy the Goflow contract
    const Goflow = await ethers.getContractFactory('Goflow');
    goflow = await Goflow.deploy();
    await goflow.deployed();

    // Deploy the Forum contract
    const Forum = await ethers.getContractFactory('Forum');
    // We make sure to pass the address of our ERC20 contract
    // to the Forum contract's constructor!
    forum = await Forum.deploy(goflow.address);
    await forum.deployed();
  });

  describe('Deployment', () => {
    it('should deploy the Forum contract and import Goflow Token', async () => {
      console.log('Forum address: ', forum.address);
      console.log('imported Goflow address: ', await forum.Goflow());

      // Check that the Goflow contract has been imported
      // into the Forum contract correctly
      expect(await forum.Goflow()).to.equal(goflow.address);
    });
  });

  describe('Posting questions and answers', () => {
    it('should be possible to post a question', async () => {
      // Remember, we use the `connect` method to interact with
      // our smart contracts as different mock users
      const tx = await forum.connect(user1).postQuestion('are you my fren?');
      await tx.wait();
      const tx2 = await forum.connect(user2).postQuestion('suh?');
      await tx2.wait();

      // console.log('nquestion 0  ', await forum.questions(0));
      // console.log('\nquestion 1 ', await forum.questions(1));

      expect((await forum.questions(0)).message).to.equal('are you my fren?');
      expect((await forum.questions(1)).message).to.equal('suh?');
    });

    it('should be possible to post a question and answer it', async () => {
      // Using the utility function we created above
      await postQuestionsAndAnswers(user1, user2);

      expect((await forum.answers(0)).message).to.equal('yes, I am');
      expect((await forum.answers(1)).message).to.equal('dude!');
      expect((await forum.answers(0)).questionId).to.equal(0);
      expect((await forum.answers(1)).questionId).to.equal(1);
      expect((await forum.answers(0)).creatorAddress).to.equal(user1.address);
      expect((await forum.answers(1)).creatorAddress).to.equal(user2.address);
    });
  });

  describe('Upvoting answers', () => {
    it('should upvote an answer and pay the answer creator', async () => {
      // mint some tokens to you -- a.k.a. the OWNER.
      // We are connected to owner by default, but let's explicityly connect
      // so that it's easier to read the tests
      const mintTx = await goflow.connect(owner).mint(makeBig(10));
      await mintTx.wait();

      // mint user1 at least 10 tokens so that they meet requirement to receive tips
      const mintTx2 = await goflow.connect(user1).mint(makeBig(10));
      await mintTx2.wait();

      const mintTx3 = await goflow.connect(user2).mint(makeBig(10));
      await mintTx3.wait();

      // Remember, we gotta "approve before we move" with transferFrom
      const ownerApprove = await goflow.connect(owner).approve(forum.address, makeBig(10));
      await ownerApprove.wait();

      const user2Approve = await goflow.connect(user2).approve(forum.address, makeBig(10));
      await user2Approve.wait();

      await postQuestionsAndAnswers(user1, user2);

      // Our upvoteAnswer function uses the token transfeFrom method to tip
      const upvoteTx = await forum.connect(owner).upvoteAnswer(0);
      await upvoteTx.wait();
      const upvoteTx2 = await forum.connect(user2).upvoteAnswer(0);
      await upvoteTx2.wait();

      expect(await forum.getUpvotes(0)).to.equal(2);
      expect(await forum.getUpvotes(1)).to.equal(0);
      expect(await goflow.balanceOf(user1.address)).to.equal(makeBig(12));
    });

    it('should upvote an answer but pay the forum contract', async () => {
      const mintTx = await goflow.connect(owner).mint(makeBig(10));
      await mintTx.wait();

      const mintTx2 = await goflow.connect(user2).mint(makeBig(10));
      await mintTx2.wait();

      // "approve before we move"
      const tokenApprove = await goflow.connect(owner).approve(forum.address, makeBig(10));
      await tokenApprove.wait();

      await postQuestionsAndAnswers(user1, user2);

      const upvoteTx = await forum.connect(owner).upvoteAnswer(0);
      await upvoteTx.wait();
      const upvoteTx2 = await forum.connect(owner).upvoteAnswer(1);
      await upvoteTx2.wait();

      // console.log('goflow balance of contract at start', await goflow.balanceOf(forum.address));

      // each answer should have one upvote 👍
      expect(await forum.getUpvotes(0)).to.equal(1);
      expect(await forum.getUpvotes(1)).to.equal(1);
      // user2 has a balance of >= 10, and receives the tip! 👍
      expect(await goflow.balanceOf(user2.address)).to.equal(makeBig(11));
      // user1 has no tokens, so receives no tip...👎
      expect(await goflow.balanceOf(user1.address)).to.equal(makeBig(0));
      // ...but the contract receives the tip instead 📈
      expect(await goflow.balanceOf(forum.address)).to.equal(makeBig(1));
    });

    it('should not be possible to upvote an answer twice', async () => {
      const mintTx = await goflow.connect(owner).mint(makeBig(10));
      await mintTx.wait();

      const tokenApprove = await goflow.connect(owner).approve(forum.address, makeBig(10));
      await tokenApprove.wait();

      await postQuestionsAndAnswers(user1, user2);

      // owner upvotes answer 0 👍
      const upvoteTx = await forum.connect(owner).upvoteAnswer(0);
      await upvoteTx.wait();
      // owner upvotes answer 1 👍
      const upvoteTx2 = await forum.connect(owner).upvoteAnswer(1);
      await upvoteTx2.wait();
      // owner tries to upvote answer 0 again 👎
      // NOTE: for expecting a reverted message, we need to put await first!
      await expect(forum.connect(owner).upvoteAnswer(0)).to.be.revertedWith('User already upvoted this answer!');
      // answer 0 should only have one upvote ✅
      expect(await forum.getUpvotes(0)).to.equal(1);
      // owner should have upvoted other answers two times ✅
      expect(await forum.usersUpvoteCount(owner.address)).to.equal(2);
    });
  });
});