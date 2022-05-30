
import Login from './index';
import React from 'react';
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react';


test('login test' ,() => {
    render (<Login/>)
})