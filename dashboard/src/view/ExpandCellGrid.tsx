import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import {DataGrid, GridColDef, GridRenderCellParams} from '@mui/x-data-grid';

function isOverflown(element: Element): boolean {
	return (
		element.scrollHeight > element.clientHeight ||
		element.scrollWidth > element.clientWidth
	);
}

const GridCellExpand = React.memo(function GridCellExpand(props: {
	value: string;
	width: number;
}) {
	const {width, value} = props;
	const wrapper = React.useRef<HTMLDivElement | null>(null);
	const cellDiv = React.useRef(null);
	const cellValue = React.useRef(null);
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [showFullCell, setShowFullCell] = React.useState(false);
	const [showPopper, setShowPopper] = React.useState(false);

	const handleMouseEnter = () => {
		const current = cellValue.current;
		const isCurrentlyOverflown =
			current === null ? false : isOverflown(current);
		setShowPopper(isCurrentlyOverflown);
		setAnchorEl(cellDiv.current);
		setShowFullCell(true);
	};

	const handleMouseLeave = () => {
		setShowFullCell(false);
	};

	React.useEffect(() => {
		if (!showFullCell) {
			return undefined;
		}

		function handleKeyDown(nativeEvent: KeyboardEvent) {
			// IE11, Edge (prior to using Bink?) use 'Esc'
			if (nativeEvent.key === 'Escape' || nativeEvent.key === 'Esc') {
				setShowFullCell(false);
			}
		}

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [setShowFullCell, showFullCell]);

	const wrapperCurrent = wrapper.current;

	return (
		<Box
			ref={wrapper}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			sx={{
				alignItems: 'center',
				lineHeight: '24px',
				width: 1,
				height: 1,
				position: 'relative',
				display: 'flex',
			}}>
			<Box
				ref={cellDiv}
				sx={{
					height: 1,
					width,
					display: 'block',
					position: 'absolute',
					top: 0,
				}}
			/>
			<Box
				ref={cellValue}
				sx={{
					whiteSpace: 'nowrap',
					overflow: 'hidden',
					textOverflow: 'ellipsis',
				}}>
				{value}
			</Box>
			{showPopper && (
				<Popper
					open={showFullCell && anchorEl !== null}
					anchorEl={anchorEl}
					style={{width}}>
					<Paper
						elevation={1}
						style={{
							minHeight:
								wrapperCurrent === null
									? 30
									: wrapperCurrent.offsetHeight - 3,
						}}>
						<Typography variant='body2' style={{padding: 8}}>
							{value}
						</Typography>
					</Paper>
				</Popper>
			)}
		</Box>
	);
});
export default function ExpandCellGrid(params: GridRenderCellParams<string>) {
	return (
		<GridCellExpand
			value={params.value || ''}
			width={params.colDef.computedWidth}
		/>
	);
}