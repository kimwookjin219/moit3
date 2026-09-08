import React from 'react';

import {
    render,
    screen
} from '@testing-library/react';

import AdvertiseHeader from '../AdvertisePageHeader';


describe('AdvertiseHeader', () => {

    test('광고 관리 제목이 화면에 표시된다.', () => {

        render(<AdvertiseHeader />);

        expect(
            screen.getByText('광고 관리')
        ).toBeInTheDocument();

    });

});