import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import PropTypes from 'prop-types';

const dialogTitle = 'Choose Waiter';

export default function WaiterDialogView(props) {
	const {waiters, handleClose, handleListItemClick, open} = props;
	return (
		<Dialog onClose={handleClose} open={open}>
			<DialogTitle>{dialogTitle}</DialogTitle>
			<List sx={{pt: 0}}>
				{waiters.map(waiter => (
					<ListItem
						button
						onClick={() => handleListItemClick(waiter)}
						key={waiter}>
						<ListItemText primary={waiter} />
					</ListItem>
				))}
			</List>
		</Dialog>
	);
}

WaiterDialogView.propTypes = {
	waiters: PropTypes.array,
	handleClose: PropTypes.func,
	handleListItemClick: PropTypes.func,
	open: PropTypes.func,
};
