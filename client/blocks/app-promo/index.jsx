/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { identity, noop, sample } from 'lodash';
import store from 'store';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import { recordTracksEvent } from 'state/analytics/actions';

const getRandomPromo = () => {
	const promoOptions = [
		{
			promoCode: 'a0001',
			message: 'WordPress.com your way — desktop app now available for Mac, Windows, and Linux.',
			type: 'desktop',
		},
		{
			promoCode: 'a0002',
			message: 'Get WordPress.com app for your desktop.',
			type: 'desktop',
		},
		{
			promoCode: 'a0003',
			message: 'WordPress.com app now available for desktop.',
			type: 'desktop',
		},
		{
			promoCode: 'a0005',
			message: 'WordPress.com at your fingertips — download app for desktop.',
			type: 'desktop',
		},
		{
			promoCode: 'a0006',
			message: 'WordPress.com in the palm of your hands — download app for mobile.',
			type: 'mobile',
		},
	];

	return sample( promoOptions );
};

export const getPromoLink = ( location, promoDetails ) => {
	const { type, promoCode } = promoDetails;

	return `https://apps.wordpress.com/${ type }/?ref=promo_${ location }_${ promoCode }`;
};

export class AppPromo extends React.Component {
	static displayName = 'AppPromo';

	static propTypes = {
		location: PropTypes.string.isRequired,
	};

	constructor( props ) {
		super( props );
		const promoItem = props.promoItem || getRandomPromo();

		this.state = {
			promoItem,
			showPromo: true,
		};
	}

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_desktop_promo_view', {
			promo_location: this.props.location,
			promo_code: this.state.promoItem.promoCode,
		} );
	}

	recordClickEvent = () => {
		this.props.recordTracksEvent( 'calypso_desktop_promo_click', {
			promo_location: this.props.location,
			promo_code: this.state.promoItem.promoCode,
		} );
	};

	dismiss = () => {
		this.setState( { showPromo: false } );
		this.props.saveDismissal();
		this.props.recordTracksEvent( 'calypso_desktop_promo_dismiss', {
			promo_location: this.props.location,
			promo_code: this.state.promoItem.promoCode,
		} );
	};

	render() {
		if ( ! this.state.showPromo ) {
			return null;
		}

		const { location, translate } = this.props;
		const { promoItem } = this.state;

		return (
			<div className="app-promo">
				<button
					tabIndex="0"
					className="app-promo__dismiss"
					onClick={ this.dismiss }
					aria-label={ translate( 'Dismiss' ) }
				>
					<Gridicon icon="cross" size={ 24 } />
				</button>
				<a
					onClick={ this.recordClickEvent }
					className="app-promo__link"
					title="Try the desktop app!"
					href={ this.props.getPromoLink( location, promoItem ) }
					target="_blank"
					rel="noopener noreferrer"
				>
					<img
						className="app-promo__icon"
						src="/calypso/images/reader/promo-app-icon.png"
						width="32"
						height="32"
						alt="WordPress Desktop Icon"
					/>
					{ promoItem.message }
				</a>
			</div>
		);
	}
}

AppPromo.defaultProps = {
	translate: identity,
	recordTracksEvent: noop,
	saveDismissal: () => store.set( 'desktop_promo_disabled', true ),
	getPromoLink,
};

export default connect(
	null,
	{ recordTracksEvent }
)( localize( AppPromo ) );
