// Copyright 2017-2019 @polkadot/app-settings authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AppProps, I18nProps } from '@polkadot/ui-app/types';
import { SettingsStruct } from '../../ui-settings/src/types';

import React from 'react';
import { Button, Dropdown, Input } from '@polkadot/ui-app';
import { ActionStatus } from '@polkadot/ui-app/Status/types';
import uiSettings from '../../ui-settings/src';

import './index.css';

import translate from './translate';

type Props = AppProps & I18nProps & {
  onStatusChange: (status: ActionStatus) => void
};

type State = {
  isCustomNode: boolean,
  isUrlValid: boolean,
  settings: SettingsStruct
};

class General extends React.PureComponent<Props, State> {
  constructor (props: Props) {
    super(props);

    const settings = uiSettings.get();

    let isCustomNode = true;

    // check to see if user has saved a custom node by seeing if their URL is equal to any preset
    for (let i = 0; i < uiSettings.availableNodes.length; i++) {
      if (uiSettings.availableNodes[i].value === settings.apiUrl) {
        isCustomNode = false;
      }
    }

    this.state = {
      isCustomNode,
      isUrlValid: this.isValidUrl(settings.apiUrl),
      settings
    };
  }

  render () {
    const { t } = this.props;
    const { isUrlValid, settings: { i18nLang, uiMode, uiTheme } } = this.state;

    return (
      <div className='settings-General'>
        {this.renderEndpoint()}
        <div className='ui--row'>
          <div className='medium'>
            <Dropdown
              defaultValue={uiTheme}
              label={t('default interface theme')}
              onChange={this.onChangeUiTheme}
              options={uiSettings.availableUIThemes}
            />
          </div>
          <div className='medium'>
            <Dropdown
              defaultValue={uiMode}
              label={t('interface operation mode')}
              onChange={this.onChangeUiMode}
              options={uiSettings.availableUIModes}
            />
          </div>
        </div>
        <div className='ui--row'>
          <div className='full'>
            <Dropdown
              defaultValue={i18nLang}
              isDisabled
              label={t('default interface language')}
              options={uiSettings.availableLanguages}
            />
          </div>
        </div>
        <Button.Group>
          <Button
            isDisabled={!isUrlValid}
            isPrimary
            onClick={this.saveAndReload}
            label={t('Save & Reload')}
          />
        </Button.Group>
      </div>
    );
  }

  private renderEndpoint = () => {
    const { t } = this.props;
    const { isCustomNode, isUrlValid, settings: { apiUrl } } = this.state;

    return (
      <>
        <Button.Group isBasic>
          <Button
            isBasic
            isNegative={!isCustomNode}
            label={t('preset')}
            onClick={this.toggleCustomNode}
          />
          <Button
            isBasic
            isNegative={isCustomNode}
            label={t('custom')}
            onClick={this.toggleCustomNode}
          />
        </Button.Group>
        <div className='ui--row'>
          {
            isCustomNode
              ? (
                <Input
                  defaultValue={apiUrl}
                  isError={!isUrlValid}
                  label={t('remote node/endpoint to connect to')}
                  onChange={this.onChangeApiUrl}
                />
              )
              : (
                <Dropdown
                  defaultValue={apiUrl}
                  label={t('remote node/endpoint to connect to')}
                  onChange={this.onChangeApiUrl}
                  options={uiSettings.availableNodes}
                />
              )
          }
        </div>
      </>
    );
  }

  private onChangeApiUrl = (apiUrl: string): void => {
    this.setState(({ settings }: State) => ({
      isUrlValid: this.isValidUrl(apiUrl),
      settings: {
        ...settings,
        apiUrl
      }
    }));
  }

  private onChangeUiMode = (uiMode: string): void => {
    this.setState(({ settings }: State) => ({
      settings: {
        ...settings,
        uiMode
      }
    }));
  }

  private onChangeUiTheme = (uiTheme: string): void => {
    this.setState(({ settings }: State) => ({
      settings: {
        ...settings,
        uiTheme
      }
    }));
  }

  private toggleCustomNode = (): void => {
    this.setState(({ isCustomNode, settings }: State) => {
      // reset URL to a preset when toggled to preset
      const apiUrl = isCustomNode
        ? uiSettings.availableNodes[0].value
        : settings.apiUrl;

      return {
        isCustomNode: !isCustomNode,
        isUrlValid: true,
        settings: {
          ...settings,
          apiUrl
        }
      };
    });
  }

  private isValidUrl (apiUrl: string): boolean {
    return (
      // some random length... we probably want to parse via some lib
      (apiUrl.length >= 7) &&
      // check that it starts with a valid ws identifier
      (apiUrl.startsWith('ws://') || apiUrl.startsWith('wss://'))
    );
  }
  private saveAndReload = (): void => {
    const { settings } = this.state;

    uiSettings.set(settings);

    // HACK This is terribe, but since the API needs to re-connect, but since
    // the API does not yet handle re-connections properly, it is what it is
    window.location.reload();
  }
}

export default translate(General);
