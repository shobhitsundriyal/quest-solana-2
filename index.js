import { TresuryPair } from './TresuryWallet.js' //we have keys for tresury
import {
	Connection,
	clusterApiUrl,
	Keypair,
	LAMPORTS_PER_SOL,
	PublicKey,
	Transaction,
	SystemProgram,
	sendAndConfirmTransaction,
} from '@solana/web3.js'
import PromptSync from 'prompt-sync' //to take input on console

const prompt = PromptSync({ sigint: true })
//make a connection to devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
const userWallet = new Keypair()
const userPublicKey = new PublicKey(userWallet.publicKey).toString()
const tresuryPublicKey = new PublicKey(TresuryPair.publicKey).toString()
console.log(tresuryPublicKey)

//Give this some sol first, IRL user would be having sols
try {
	const signature = await connection.requestAirdrop(
		userWallet.publicKey,
		2 * LAMPORTS_PER_SOL
	)
	await connection.confirmTransaction(signature).then(async () => {
		console.log(
			'User Balance: ',
			(await connection.getBalance(userWallet.publicKey)) /
				LAMPORTS_PER_SOL
		)
	})
} catch (err) {
	console.log(err)
}

//console I/O
var stakingAmt = prompt('Enter amount of SOL that you will stake ')
console.log('You will get %f if you guess the right number', stakingAmt * 1.25)
console.log('Choose number 0-9 inclusive')

let luckyNo = Math.floor(Math.random() * 10) //number between 0-9 inclusive
const choice = prompt('Choose a number ')

luckyNo = 1
//Transactions:
if (choice == luckyNo) {
	// send 0.25*staking amount to user from Tresury
	try {
		const transaction = new Transaction().add(
			SystemProgram.transfer({
				from: tresuryPublicKey,
				to: userPublicKey,
				lamports: LAMPORTS_PER_SOL * 0.25 * stakingAmt,
			})
		)
		const signature = await sendAndConfirmTransaction(
			connection,
			transaction,
			[TresuryPair]
		).then(() => {
			console.log('Sig. ', signature)
		})
	} catch (err) {
		console.log(err)
	}
} else {
	// send staking amount to Tresury
	try {
		const transaction = new Transaction().add(
			SystemProgram.transfer({
				from: userWallet.publicKey,
				to: TresuryPair.publicKey,
				lamports: LAMPORTS_PER_SOL * stakingAmt,
			})
		)
		const signature = await sendAndConfirmTransaction(
			connection,
			transaction,
			[userWallet]
		).then(() => {
			console.log('Sig. ', signature)
		})
	} catch (err) {
		console.log(err)
	}
}

console.log(
	'User Balance: ',
	(await connection.getBalance(userWallet.publicKey)) / LAMPORTS_PER_SOL
)
