import { ethers } from 'hardhat';
import { describeBehaviorOfERC20Metadata } from '@solidstate/spec';
import {
  ERC20MetadataMock,
  ERC20MetadataMock__factory,
} from '../../../typechain';

describe('ERC20Metadata', function () {
  const name = 'ERC20Metadata.name';
  const symbol = 'ERC20Metadata.symbol';
  const decimals = 18;
  let instance: ERC20MetadataMock;

  beforeEach(async function () {
    const [deployer] = await ethers.getSigners();
    instance = await new ERC20MetadataMock__factory(deployer).deploy(
      name,
      symbol,
      decimals,
    );
  });

  describeBehaviorOfERC20Metadata({
    deploy: async () => instance as any,
    name,
    symbol,
    decimals,
  });
});
