import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { isHexString } from 'ethereumjs-util';

import {
  isValidDomainName,
  getHexAddressFromQtum,
  getQtumAddressFromHex,
} from '../../../../helpers/utils/util';
import { addHexPrefix } from '../../../../../app/scripts/lib/util';
import {
  isBurnAddress,
  isValidHexAddress,
} from '../../../../../shared/modules/hexstring-utils';

export default class EnsInput extends Component {
  static contextTypes = {
    t: PropTypes.func,
    metricsEvent: PropTypes.func,
  };

  static propTypes = {
    className: PropTypes.string,
    chainId: PropTypes.string,
    selectedAddress: PropTypes.string,
    qtumAddressBook: PropTypes.object,
    isQtumAddressShowCheck: PropTypes.bool,
    selectedName: PropTypes.string,
    scanQrCode: PropTypes.func,
    onPaste: PropTypes.func,
    onValidAddressTyped: PropTypes.func,
    internalSearch: PropTypes.bool,
    userInput: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    lookupEnsName: PropTypes.func.isRequired,
    initializeEnsSlice: PropTypes.func.isRequired,
    resetEnsResolution: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.initializeEnsSlice();
  }

  isBase58 = (value) => /^[A-HJ-NP-Za-km-z1-9]*$/.test(value);

  onPaste = (event) => {
    if (event.clipboardData.items?.length) {
      const clipboardItem = event.clipboardData.items[0];
      clipboardItem?.getAsString((text) => {
        const input = text.trim();
        let hexAddress = input;
        if (this.isBase58(input) && input[0] !== 'A' && !isHexString(input)) {
          hexAddress = getHexAddressFromQtum(input);
        }
        if (
          !isBurnAddress(hexAddress) &&
          isValidHexAddress(hexAddress, { mixedCaseUseChecksum: true })
        ) {
          this.props.onPaste(hexAddress);
        }
      });
    }
  };

  onChange = ({ target: { value } }) => {
    const {
      onValidAddressTyped,
      internalSearch,
      onChange,
      lookupEnsName,
      resetEnsResolution,
    } = this.props;
    const input = value.trim();
    let hexAddress = input;
    if (this.isBase58(input) && input[0] !== 'A' && !isHexString(input)) {
      hexAddress = getHexAddressFromQtum(input);
    }
    onChange(hexAddress);

    if (internalSearch) {
      return null;
    }
    // Empty ENS state if input is empty
    // maybe scan ENS
    if (isValidDomainName(hexAddress)) {
      lookupEnsName(hexAddress);
    } else {
      resetEnsResolution();

      if (
        onValidAddressTyped &&
        !isBurnAddress(hexAddress) &&
        isValidHexAddress(hexAddress, { mixedCaseUseChecksum: true })
      ) {
        onValidAddressTyped(hexAddress);
      }
    }

    return null;
  };

  convertAddress = (input) => {
    const { chainId, isQtumAddressShowCheck } = this.props;
    if (isQtumAddressShowCheck && isHexString(input) && input !== '') {
      const newAddress = getQtumAddressFromHex(input, chainId);
      return newAddress;
    } else if (
      !isQtumAddressShowCheck &&
      this.isBase58(input) &&
      input !== '' &&
      input[0] !== 'A'
    ) {
      const newAddress = getHexAddressFromQtum(input);
      return newAddress;
    }
    return input;
  };

  render() {
    const { t } = this.context;
    const {
      className,
      selectedAddress,
      selectedName,
      userInput,
      qtumAddressBook,
      isQtumAddressShowCheck,
    } = this.props;

    const hasSelectedAddress = Boolean(selectedAddress);

    return (
      <div className={classnames('ens-input', className)}>
        <div
          className={classnames('ens-input__wrapper', {
            'ens-input__wrapper__status-icon--error': false,
            'ens-input__wrapper__status-icon--valid': false,
            'ens-input__wrapper--valid': hasSelectedAddress,
          })}
        >
          <i
            className={classnames('ens-input__wrapper__status-icon', 'fa', {
              'fa-check-circle': hasSelectedAddress,
              'fa-search': !hasSelectedAddress,
            })}
            style={{
              color: hasSelectedAddress
                ? 'var(--color-success-default)'
                : 'var(--color-icon-muted)',
            }}
          />
          {hasSelectedAddress ? (
            <>
              <div className="ens-input__wrapper__input ens-input__wrapper__input--selected">
                <div className="ens-input__selected-input__title">
                  {this.convertAddress(selectedName) ||
                    (isQtumAddressShowCheck
                      ? qtumAddressBook[selectedAddress]
                      : this.convertAddress(selectedAddress))}
                </div>
                {selectedName !== selectedAddress && (
                  <div className="ens-input__selected-input__subtitle">
                    {isQtumAddressShowCheck
                      ? qtumAddressBook[selectedAddress]
                      : selectedAddress}
                  </div>
                )}
              </div>
              <button
                onClick={this.props.onReset}
                className="ens-input__wrapper__action-icon-button"
              >
                <i
                  className="fa fa-times"
                  style={{
                    color: 'var(--color-icon-default)',
                  }}
                  title={t('close')}
                />
              </button>
            </>
          ) : (
            <>
              <div
                className={classnames('ens-input__wrapper__status-icon', {
                  'ens-input__wrapper__status-icon--valid': hasSelectedAddress,
                })}
              />
              <input
                className="ens-input__wrapper__input"
                type="text"
                dir="auto"
                placeholder={t('recipientAddressPlaceholder')}
                onChange={this.onChange}
                onPaste={this.onPaste}
                spellCheck="false"
                value={
                  this.convertAddress(selectedAddress) ||
                  this.convertAddress(userInput)
                }
                autoFocus
                data-testid="ens-input"
              />
              <button
                className="ens-input__wrapper__action-icon-button"
                onClick={() => {
                  if (userInput) {
                    this.props.onReset();
                  } else {
                    this.props.scanQrCode();
                  }
                }}
              >
                <i
                  className={classnames('fa', {
                    'fa-times': userInput,
                    'fa-qrcode': !userInput,
                  })}
                  title={t(userInput ? 'close' : 'scanQrCode')}
                  style={{
                    color: userInput
                      ? 'var(--color-icon-default)'
                      : 'var(--color-primary-default)',
                  }}
                />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }
}
