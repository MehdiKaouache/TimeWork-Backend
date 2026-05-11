import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Company } from './entity/company.entity';

@Injectable()
export class CompanyService {

  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async findOne(id: number): Promise<Company> {

    const company = await this.companyRepo.findOne({
      where: {
        id,
        isDeleted: false,
      },
      relations: ['jobRoles'],
    });

    if (!company) {
      throw new NotFoundException(
        'Entreprise non trouvée'
      );
    }

    return company;
  }

  async update(
    id: number,
    updateData: Partial<Company>,
  ): Promise<Company> {

    const company = await this.findOne(id);

    Object.assign(company, updateData);

    return this.companyRepo.save(company);
  }

  async findByCode(code: string): Promise<Company> {

    const company = await this.companyRepo.findOne({
      where: {
        companyCode: code,
        isDeleted: false,
      },
    });

    if (!company) {
      throw new NotFoundException(
        'Code entreprise invalide'
      );
    }

    return company;
  }
}