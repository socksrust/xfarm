import React, { useState } from "react";
import styled from '@emotion/styled'
import Space from '../common/space'

import { Text, useToast, Input, Button, Switch, Image, Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalHeader, ModalBody, useDisclosure, ModalFooter } from '@chakra-ui/react';

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

Date.prototype.addHours = function(h){
	this.setHours(this.getHours()+h);
	return this;
}

//import "./dice.css";
const CountDown = ({ countDownDate, firstPlacePoints, setPotNumber, potNumber }) => {
	const [text, setText] = useState(' ')
	const [multiplier, setMultiplier] = useState(' ')
  const { isOpen, onOpen, onClose } = useDisclosure()

	var x = setInterval(function() {

		// Get today's date and time
		var now = new Date().getTime();
		let n = 1;
		while(countDownDate <= now) {
			n+=1;
			countDownDate.addHours(24)
		}
		console.log({ potNumber, n, is: Number(potNumber) < Number(n)})

		if(Number(potNumber) !== 0 && Number(potNumber) < Number(n)) {
			setPotNumber(n)
		}


		// Find the distance between now and the count down date
		var distance = countDownDate - now;

		// Time calculations for days, hours, minutes and seconds
		var days = Math.floor(distance / (1000 * 60 * 60 * 24));
		var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		var seconds = Math.floor((distance % (1000 * 60)) / 1000);

		// Display the result in the element with id="demo"
		const newText = days + "d " + hours + "h "
		+ minutes + "m " + seconds + "s ";
		setText(newText)
		


		let multi = 0;
		if(minutes <= 9) {
			multi = (Number(`${hours}0${minutes}0`))
		} else {
			multi = (Number(`${hours}${minutes}0`))
		}

		const final = multi**2

		setMultiplier(final)
		setMultiplier(final)

		// If the count down is finished, write some text
		if (distance < 0) {
			clearInterval(x);
			setText("EXPIRED")
		}
	}, 1000);

	const minBet = Number(firstPlacePoints*1.01/Number(multiplier));

	return (
		<Column>
			<Column>
				<Text fontSize="48px" fontWeight="bold">
					{text}
				</Text>
				<Text fontSize="26px" fontWeight="bold" marginTop={0} color="rgba(80, 227, 194, 1)">
					Multiplier: {multiplier && multiplier.toLocaleString(undefined)}x
				</Text>
				<Row>
					<Text fontSize="18px" fontWeight="bold" marginTop={0} color="rgba(80, 227, 194, 1)">
						Current minimum bet to win: {minBet.toLocaleString(undefined)} $SOL
					</Text>
					<Space width={20} />
					<Button borderRadius="2rem" width="130px" height="25px" borderColor="#fff" onClick={() => navigator.clipboard.writeText(minBet.toLocaleString(undefined))}>
						<Text fontSize="12px" fontWeight="bold" color="#000">Copy min Value</Text>
					</Button>
				</Row>
			</Column>
			<Space height={20} />
			<Button borderRadius="2rem" width="120px" height="36px" borderColor="#fff" onClick={onOpen}>
				<Text fontSize="14px" fontWeight="bold" color="#000">Read rules</Text>
			</Button>
			<Modal onClose={onClose} isOpen={isOpen} isCentered>
				<ModalOverlay />
				<ModalContent>
					<ModalCloseButton color="#000" />
					<ModalHeader>
						<Text fontSize="24px" fontWeight="bold" color="#070B17">
							Race rules:
						</Text>
					</ModalHeader>
					<ModalBody paddingTop="0px">
						<Text fontSize="16px" fontWeight="normal" color="#070B17">
						The bet you place is multiplied by the multiplier. With each passing minute the multiplier decreases. So you need to place a higher bet to get more points. Every 24 hours the multiplier is reset and goes back to maximum. 

						</Text>
						<Space height={20} />

						<Text fontSize="16px" fontWeight="normal" color="#070B17">
							That is, the higher the multiplier the more points you can score. And the top 3 places receive the jackpot value. So it's just a matter of math and tracking. The more points you have, the greater chance of winning.
						</Text>
					</ModalBody>
				</ModalContent>
			</Modal>
		</Column>
	);
};
export default CountDown;
