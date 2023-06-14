import {Component, OnInit} from '@angular/core';
import {StudentsService} from "../students.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Student} from "../student";

@Component({
  selector: 'app-view-student',
  templateUrl: './view-student.component.html',
  styleUrls: ['./view-student.component.css']
})
export class ViewStudentComponent implements OnInit {
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
