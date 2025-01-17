import { expect } from 'chai';
import { ethers } from 'hardhat';
import { describeBehaviorOfFactory } from '@solidstate/spec';
import { FactoryMock, FactoryMock__factory } from '../../typechain';

describe('Factory', function () {
  let instance: FactoryMock;

  beforeEach(async function () {
    const [deployer] = await ethers.getSigners();
    instance = await new FactoryMock__factory(deployer).deploy();
  });

  describeBehaviorOfFactory({ deploy: async () => instance });

  describe('__internal', function () {
    describe('#_deploy', function () {
      describe('(bytes)', function () {
        it('deploys bytecode and returns deployment address', async function () {
          const initCode = instance.deployTransaction.data;

          const address = await instance.callStatic['__deploy(bytes)'](
            initCode,
          );
          expect(address).to.be.properAddress;

          await instance['__deploy(bytes)'](initCode);

          expect(await ethers.provider.getCode(address)).to.equal(
            await ethers.provider.getCode(instance.address),
          );
        });

        describe('reverts if', function () {
          it('contract creation fails', async function () {
            const initCode = '0xfe';

            await expect(instance['__deploy(bytes)'](initCode)).to.revertedWith(
              'Factory: failed deployment',
            );
          });
        });
      });

      describe('(bytes,bytes32)', function () {
        it('deploys bytecode and returns deployment address', async function () {
          const initCode = await instance.deployTransaction.data;
          const initCodeHash = ethers.utils.keccak256(initCode);
          const salt = ethers.utils.randomBytes(32);

          const address = await instance.callStatic['__deploy(bytes,bytes32)'](
            initCode,
            salt,
          );
          expect(address).to.equal(
            await instance.callStatic.__calculateDeploymentAddress(
              initCodeHash,
              salt,
            ),
          );

          await instance['__deploy(bytes,bytes32)'](initCode, salt);

          expect(await ethers.provider.getCode(address)).to.equal(
            await ethers.provider.getCode(instance.address),
          );
        });

        describe('reverts if', function () {
          it('contract creation fails', async function () {
            const initCode = '0xfe';
            const salt = ethers.utils.randomBytes(32);

            await expect(
              instance['__deploy(bytes,bytes32)'](initCode, salt),
            ).to.revertedWith('Factory: failed deployment');
          });

          it('salt has already been used', async function () {
            const initCode = instance.deployTransaction.data;
            const salt = ethers.utils.randomBytes(32);

            await instance['__deploy(bytes,bytes32)'](initCode, salt);

            await expect(
              instance['__deploy(bytes,bytes32)'](initCode, salt),
            ).to.be.revertedWith('Factory: failed deployment');
          });
        });
      });
    });

    describe('#_calculateDeploymentAddress', function () {
      it('returns address of not-yet-deployed contract', async function () {
        const initCode = instance.deployTransaction.data;
        const initCodeHash = ethers.utils.keccak256(initCode);
        const salt = ethers.utils.randomBytes(32);

        expect(
          await instance.callStatic.__calculateDeploymentAddress(
            initCodeHash,
            salt,
          ),
        ).to.equal(
          ethers.utils.getCreate2Address(instance.address, salt, initCodeHash),
        );
      });
    });
  });
});
