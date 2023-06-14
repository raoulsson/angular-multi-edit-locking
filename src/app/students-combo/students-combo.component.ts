import { Component, OnInit } from '@angular/core';
import {StudentsService} from "../students.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Student} from "../student";

@Component({
  selector: 'app-child-combo',
  templateUrl: './students-combo.component.html',
  styleUrls: ['./students-combo.component.css']
})
export class StudentsComboComponent implements OnInit {
  studentShell: Student = {
    id: 0,
    firstName: '',
    lastName: '',
    gender: 'Male',
    age: 0,
  };

  constructor(
    private studentService: StudentsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((param) => {
      const id = String(param.get('id'));
      this.getById(id);
    });
  }

  getById(id: string) {
    this.studentService.getById(id).subscribe((data) => {
      this.studentShell = data;
    });
  }

}
