import { render, screen } from '@testing-library/react';
import { HaremGirlTile, SimpleGirlTile } from '../components/girl';

import ownedGirl from './testdata/ownedGirl.json';
import missingGirl from './testdata/missingGirl.json';
import partialGirl from './testdata/partialGirl.json';
import { CommonGirlData } from '../data/data';

describe('Girl Tiles', () => {
  test('Simple girl tile, owned', () => {
    const { container } = render(
      <SimpleGirlTile
        girl={ownedGirl as CommonGirlData}
        onClick={() => {
          /* Empty */
        }}
        selected={false}
        show0Pose={false}
      />
    );
    const tile = container.firstChild;
    // image is visible
    const image = screen.getByAltText('Bunny') as HTMLImageElement;
    expect(image).toBeVisible();
    expect(image.src).toContain(
      'https://hh2.hh-content.com/pictures/girls/1/ico3.png'
    );
    // level is hidden on simple tiles
    expect(screen.queryByText('700/700')).toBeNull();
    // tile is not selected
    expect(tile).not.toHaveClass('selected');

    // owned CSS class
    expect(tile).toHaveClass('owned', 'girlTile');
  });

  test('Simple girl tile, not owned', () => {
    const { container } = render(
      <SimpleGirlTile
        girl={missingGirl as CommonGirlData}
        onClick={() => {
          /* Empty */
        }}
        selected={false}
        show0Pose={false}
      />
    );
    const tile = container.firstChild;
    const image = screen.getByAltText('Kimie Halloween') as HTMLImageElement;
    expect(image).toBeVisible();
    expect(image.src).toContain(
      'https://hh2.hh-content.com/pictures/girls/22/ico0.png'
    );
    expect(tile).toHaveClass('not-owned', 'girlTile');
  });

  test('Simple girl tile, 0 Pose', () => {
    render(
      <SimpleGirlTile
        girl={ownedGirl as CommonGirlData}
        onClick={() => {
          /* Empty */
        }}
        selected={false}
        show0Pose={true}
      />
    );
    // image is visible
    const image = screen.getByAltText('Bunny') as HTMLImageElement;
    expect(image).toBeVisible();
    expect(image.src).toContain(
      'https://hh2.hh-content.com/pictures/girls/1/ico0.png'
    );
    // level is hidden on simple tiles
    expect(screen.queryByText('700/700')).toBeNull();
  });

  test('Harem girl tile, owned', () => {
    render(
      <HaremGirlTile
        girl={ownedGirl as CommonGirlData}
        collectSalary={() => {
          /* Nothing */
        }}
        selectGirl={() => {
          /* Nothing */
        }}
        payAt={Date.now() + 60000}
        selected={false}
        show0Pose={false}
      />
    );
    // image is visible
    expect(screen.getByAltText('Bunny')).toBeVisible();
    // level is visible in harem tile
    const levelContainer = screen.queryByText('700/700');
    expect(levelContainer).toBeVisible();
    expect(levelContainer).toHaveClass('girl-header');
  });

  test('Harem girl tile, partial', () => {
    const { container } = render(
      <HaremGirlTile
        girl={partialGirl as CommonGirlData}
        collectSalary={() => {
          /* Nothing */
        }}
        selectGirl={() => {
          /* Nothing */
        }}
        payAt={Date.now() + 60000}
        selected={false}
        show0Pose={false}
      />
    );
    expect(screen.getByAltText('Ankyo de Noël')).toBeVisible();
    // Shards are visible
    expect(screen.getByText('20/100')).toBeVisible();

    // Girls that are partially owned don't have a header (with their current level)
    const level = container.getElementsByClassName('girl-header');
    expect(level.length).toBe(0);
  });

  test('Harem girl tile, not owned', () => {
    const { container } = render(
      <HaremGirlTile
        girl={missingGirl as CommonGirlData}
        collectSalary={() => {
          /* Nothing */
        }}
        selectGirl={() => {
          /* Nothing */
        }}
        payAt={0}
        selected={false}
        show0Pose={false}
      />
    );
    const image = screen.getByAltText('Kimie Halloween') as HTMLImageElement;
    expect(image).toBeVisible();
    expect(image.src).toContain(
      'https://hh2.hh-content.com/pictures/girls/22/ico0.png'
    );

    // Girls that aren't owned don't have a header (with their current level)
    const level = container.getElementsByClassName('girl-header');
    expect(level.length).toBe(0);
  });

  test('Simple girl tile, selected', () => {
    const { container } = render(
      <SimpleGirlTile
        girl={ownedGirl as CommonGirlData}
        onClick={() => {
          /* Empty */
        }}
        selected={true}
        show0Pose={false}
      />
    );
    const tile = container.firstChild;
    // image is visible
    const image = screen.getByAltText('Bunny') as HTMLImageElement;
    expect(image).toBeVisible();
    expect(image.src).toContain(
      'https://hh2.hh-content.com/pictures/girls/1/ico3.png'
    );
    // div is selected
    expect(tile).toHaveClass('selected');
  });
});
